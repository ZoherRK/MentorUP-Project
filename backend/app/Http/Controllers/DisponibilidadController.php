<?php

namespace App\Http\Controllers;

use App\Models\DisponibilidadHoraria;
use App\Models\Profesor;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * CONTROLLER: DisponibilidadController
 *
 * Gestiona la disponibilidad horaria semanal de los profesores.
 *
 * GET  /api/disponibilidad                → Lista del profesor autenticado
 * POST /api/disponibilidad                → Guarda disponibilidad completa (reemplaza todo)
 * GET  /api/profesores/{id}/disponibilidad → Disponibilidad pública de un profesor
 */
class DisponibilidadController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────
    // INDEX — disponibilidad del profesor autenticado
    // ─────────────────────────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $usuario = $request->user();

        if ($usuario->getRol() !== 'profesor') {
            return response()->json(['ok' => false, 'mensaje' => 'Solo los profesores tienen disponibilidad horaria.'], 403);
        }

        $profesor = Profesor::where('usuario_id', $usuario->id)->firstOrFail();
        $disponibilidad = DisponibilidadHoraria::where('profesor_id', $profesor->id)
            ->orderBy('dia_semana')
            ->orderBy('hora_inicio')
            ->get();

        return response()->json(['ok' => true, 'data' => $disponibilidad]);
    }

    // ─────────────────────────────────────────────────────────────────────
    // SAVE — guarda/reemplaza la disponibilidad completa
    // ─────────────────────────────────────────────────────────────────────

    public function save(Request $request): JsonResponse
    {
        $usuario = $request->user();

        if ($usuario->getRol() !== 'profesor') {
            return response()->json(['ok' => false, 'mensaje' => 'Solo los profesores pueden configurar su disponibilidad.'], 403);
        }

        $data = $request->validate([
            'bloques'                 => 'required|array|max:50',
            'bloques.*.dia_semana'    => 'required|integer|between:0,6',
            'bloques.*.hora_inicio'   => 'required|date_format:H:i',
            'bloques.*.hora_fin'      => 'required|date_format:H:i|after:bloques.*.hora_inicio',
        ]);

        $profesor = Profesor::where('usuario_id', $usuario->id)->firstOrFail();

        // Validar solapamientos dentro de los bloques enviados
        $bloques = $data['bloques'];
        foreach ($bloques as $i => $b1) {
            foreach ($bloques as $j => $b2) {
                if ($i >= $j) continue;
                if ($b1['dia_semana'] !== $b2['dia_semana']) continue;

                // Check overlap: b1.inicio < b2.fin && b2.inicio < b1.fin
                if ($b1['hora_inicio'] < $b2['hora_fin'] && $b2['hora_inicio'] < $b1['hora_fin']) {
                    return response()->json([
                        'ok'      => false,
                        'mensaje' => 'Hay bloques horarios solapados en el mismo día. Por favor, revisa tu disponibilidad.',
                    ], 422);
                }
            }
        }

        // Reemplazar toda la disponibilidad
        DisponibilidadHoraria::where('profesor_id', $profesor->id)->delete();

        foreach ($bloques as $bloque) {
            DisponibilidadHoraria::create([
                'profesor_id' => $profesor->id,
                'dia_semana'  => $bloque['dia_semana'],
                'hora_inicio' => $bloque['hora_inicio'],
                'hora_fin'    => $bloque['hora_fin'],
                'activo'      => true,
            ]);
        }

        $nueva = DisponibilidadHoraria::where('profesor_id', $profesor->id)
            ->orderBy('dia_semana')->orderBy('hora_inicio')
            ->get();

        return response()->json([
            'ok'      => true,
            'mensaje' => 'Disponibilidad guardada correctamente.',
            'data'    => $nueva,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────
    // PUBLIC — disponibilidad visible para alumnos al reservar
    // ─────────────────────────────────────────────────────────────────────

    public function publicShow(int $profesorId): JsonResponse
    {
        $profesor = Profesor::find($profesorId);

        if (!$profesor) {
            return response()->json(['ok' => false, 'mensaje' => 'Profesor no encontrado.'], 404);
        }

        $disponibilidad = DisponibilidadHoraria::where('profesor_id', $profesorId)
            ->where('activo', true)
            ->orderBy('dia_semana')
            ->orderBy('hora_inicio')
            ->get(['dia_semana', 'hora_inicio', 'hora_fin']);

        return response()->json(['ok' => true, 'data' => $disponibilidad]);
    }

    // ─────────────────────────────────────────────────────────────────────
    // VERIFY DATE — comprueba si una fecha es válida para reservar
    // ─────────────────────────────────────────────────────────────────────

    public function verificarFecha(Request $request, int $profesorId): JsonResponse
    {
        $data = $request->validate([
            'fecha_clase' => 'required|date|after:now',
        ]);

        $profesor = Profesor::with('disponibilidad')->find($profesorId);

        if (!$profesor) {
            return response()->json(['ok' => false, 'mensaje' => 'Profesor no encontrado.'], 404);
        }

        $dt         = new \DateTime($data['fecha_clase']);
        $disponible = $profesor->estaDisponible($dt);

        return response()->json([
            'ok'          => true,
            'disponible'  => $disponible,
            'mensaje'     => $disponible
                ? 'El profesor está disponible en esta franja horaria.'
                : 'El profesor no está disponible en esta franja horaria. Consulta su disponibilidad.',
        ]);
    }
}
