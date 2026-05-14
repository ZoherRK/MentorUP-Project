<?php

namespace App\Http\Controllers;

use App\Models\Anuncio;
use App\Models\Alumno;
use App\Models\Reserva;
use App\Models\Profesor;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * CONTROLLER: ReservaController
 *
 * GET  /api/reservas                    → Mis reservas (alumno: propias; profesor: recibidas)
 * POST /api/reservas                    → Crear reserva (alumno) — valida disponibilidad
 * POST /api/reservas/{id}/cancelar      → Cancelar (alumno o profesor)
 * PUT  /api/reservas/{id}/confirmar     → Confirmar (profesor)
 * PUT  /api/reservas/{id}/completar     → Marcar completada (profesor)
 */
class ReservaController extends Controller
{
    // ── INDEX ─────────────────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $usuario = $request->user();
        $rol     = $usuario->getRol();

        if ($rol === 'alumno') {
            $alumno   = Alumno::where('usuario_id', $usuario->id)->firstOrFail();
            $reservas = Reserva::with(['anuncio.profesor.usuario'])
                ->where('alumno_id', $alumno->id)
                ->orderByDesc('created_at')
                ->get();

        } elseif ($rol === 'profesor') {
            $reservas = Reserva::with(['anuncio', 'alumno.usuario'])
                ->whereHas('anuncio', function ($q) use ($usuario) {
                    $q->whereHas('profesor', fn($q2) => $q2->where('usuario_id', $usuario->id));
                })
                ->orderByDesc('created_at')
                ->get();
        } else {
            $reservas = Reserva::with(['anuncio.profesor.usuario', 'alumno.usuario'])
                ->orderByDesc('created_at')
                ->paginate(20);
        }

        return response()->json(['ok' => true, 'data' => $reservas]);
    }

    // ── STORE ─────────────────────────────────────────────────────────────

    public function store(Request $request): JsonResponse
    {
        $usuario = $request->user();

        if ($usuario->getRol() !== 'alumno') {
            return response()->json(['ok' => false, 'mensaje' => 'Solo los alumnos pueden solicitar clases.'], 403);
        }

        $data = $request->validate([
            'anuncio_id'   => 'required|integer|exists:anuncios,id',
            'fecha_clase'  => 'required|date|after:now',
            'duracion_h'   => 'required|numeric|in:0.5,1,1.5,2',
            'notas_alumno' => 'nullable|string|max:500',
        ]);

        // Verificar que el anuncio está activo y aprobado
        $anuncio = Anuncio::where('id', $data['anuncio_id'])
            ->where('activo', true)
            ->where('verificado', 'aprobado')
            ->with('profesor.disponibilidad')
            ->first();

        if (!$anuncio) {
            return response()->json(['ok' => false, 'mensaje' => 'Este anuncio no está disponible para reservas.'], 422);
        }

        // ── VALIDACIÓN DE DISPONIBILIDAD ──────────────────────────────────
        $profesor = $anuncio->profesor;

        // Solo validar si el profesor tiene disponibilidad configurada
        if ($profesor->disponibilidad->isNotEmpty()) {
            $dt = new \DateTime($data['fecha_clase']);
            if (!$profesor->estaDisponible($dt)) {
                return response()->json([
                    'ok'      => false,
                    'mensaje' => 'El profesor no está disponible en esa franja horaria. Consulta sus horarios disponibles.',
                ], 422);
            }
        }

        $alumno = Alumno::where('usuario_id', $usuario->id)->firstOrFail();

        // No duplicar reservas activas para el mismo anuncio
        $yaExiste = Reserva::where('alumno_id', $alumno->id)
            ->where('anuncio_id', $anuncio->id)
            ->whereIn('estado', ['pendiente', 'confirmada'])
            ->exists();

        if ($yaExiste) {
            return response()->json(['ok' => false, 'mensaje' => 'Ya tienes una solicitud activa para este anuncio.'], 422);
        }

        $precioTotal = $anuncio->precio_hora * $data['duracion_h'];

        $reserva = Reserva::create([
            'alumno_id'    => $alumno->id,
            'anuncio_id'   => $anuncio->id,
            'fecha_clase'  => $data['fecha_clase'],
            'duracion_h'   => $data['duracion_h'],
            'precio_total' => $precioTotal,
            'notas_alumno' => $data['notas_alumno'] ?? null,
            'estado'       => 'pendiente',
        ]);

        return response()->json([
            'ok'      => true,
            'mensaje' => 'Solicitud de clase enviada correctamente.',
            'data'    => $reserva->load('anuncio.profesor.usuario'),
        ], 201);
    }

    // ── CANCELAR ──────────────────────────────────────────────────────────

    public function cancelar(Request $request, int $id): JsonResponse
    {
        $usuario = $request->user();
        $reserva = Reserva::with('anuncio.profesor')->find($id);

        if (!$reserva) {
            return response()->json(['ok' => false, 'mensaje' => 'Reserva no encontrada.'], 404);
        }

        if (!in_array($reserva->estado, ['pendiente', 'confirmada'])) {
            return response()->json(['ok' => false, 'mensaje' => 'Esta reserva no se puede cancelar.'], 422);
        }

        $alumno     = Alumno::where('usuario_id', $usuario->id)->first();
        $esAlumno   = $alumno && $reserva->alumno_id === $alumno->id;
        $esProfesor = $reserva->anuncio->profesor->usuario_id === $usuario->id;

        if (!$esAlumno && !$esProfesor && $usuario->getRol() !== 'admin') {
            return response()->json(['ok' => false, 'mensaje' => 'No tienes permiso.'], 403);
        }

        $reserva->update(['estado' => 'cancelada']);

        return response()->json(['ok' => true, 'mensaje' => 'Reserva cancelada.']);
    }

    // ── CONFIRMAR ─────────────────────────────────────────────────────────

    public function confirmar(Request $request, int $id): JsonResponse
    {
        $usuario = $request->user();
        $reserva = Reserva::with('anuncio.profesor')->find($id);

        if (!$reserva) return response()->json(['ok' => false, 'mensaje' => 'Reserva no encontrada.'], 404);
        if ($reserva->anuncio->profesor->usuario_id !== $usuario->id)
            return response()->json(['ok' => false, 'mensaje' => 'No tienes permiso.'], 403);
        if ($reserva->estado !== 'pendiente')
            return response()->json(['ok' => false, 'mensaje' => 'Solo se pueden confirmar reservas pendientes.'], 422);

        $reserva->update(['estado' => 'confirmada']);
        return response()->json(['ok' => true, 'mensaje' => 'Reserva confirmada.', 'data' => $reserva]);
    }

    // ── COMPLETAR ─────────────────────────────────────────────────────────

    public function completar(Request $request, int $id): JsonResponse
    {
        $usuario = $request->user();
        $reserva = Reserva::with('anuncio.profesor')->find($id);

        if (!$reserva) return response()->json(['ok' => false, 'mensaje' => 'Reserva no encontrada.'], 404);
        if ($reserva->anuncio->profesor->usuario_id !== $usuario->id)
            return response()->json(['ok' => false, 'mensaje' => 'No tienes permiso.'], 403);
        if ($reserva->estado !== 'confirmada')
            return response()->json(['ok' => false, 'mensaje' => 'Solo se pueden completar reservas confirmadas.'], 422);

        $reserva->update(['estado' => 'completada']);
        return response()->json(['ok' => true, 'mensaje' => 'Clase marcada como completada.', 'data' => $reserva]);
    }
}
