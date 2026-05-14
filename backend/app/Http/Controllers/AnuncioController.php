<?php

namespace App\Http\Controllers;

use App\Models\Anuncio;
use App\Models\Profesor;
use App\Models\DisponibilidadHoraria;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * CONTROLLER: AnuncioController
 *
 * GET    /api/anuncios           → Public: list approved anuncios (with filters)
 * GET    /api/anuncios/{id}      → Public: detail of a single anuncio
 * POST   /api/anuncios           → Protected (profesor): create anuncio
 * PUT    /api/anuncios/{id}      → Protected (profesor owner): update anuncio
 * DELETE /api/anuncios/{id}      → Protected (profesor owner): soft-delete (set activo=false)
 */
class AnuncioController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────
    // INDEX — list approved/active anuncios
    // ─────────────────────────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $query = Anuncio::with(['profesor.usuario'])
            ->where('activo', true)
            ->where('verificado', 'aprobado');

        // Optional filters
        if ($request->filled('asignatura')) {
            $query->where('asignatura', 'like', '%' . $request->asignatura . '%');
        }

        if ($request->filled('ciudad')) {
            $query->whereHas('profesor.usuario', function ($q) use ($request) {
                $q->where('ciudad', 'like', '%' . $request->ciudad . '%');
            });
        }

        if ($request->filled('precio_max')) {
            $query->where('precio_hora', '<=', (float) $request->precio_max);
        }

        if ($request->filled('nivel')) {
            $query->where('nivel', $request->nivel);
        }

        $anuncios = $query->orderByDesc('destacado')
                          ->orderByDesc('created_at')
                          ->paginate(12);

        return response()->json([
            'ok'   => true,
            'data' => $anuncios,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────
    // SHOW — single anuncio (public)
    // ─────────────────────────────────────────────────────────────────────

    public function show(int $id): JsonResponse
    {
        $anuncio = Anuncio::with(['profesor.usuario', 'valoraciones.alumno.usuario'])
            ->where('activo', true)
            ->find($id);

        if (! $anuncio) {
            return response()->json([
                'ok'      => false,
                'mensaje' => 'Anuncio no encontrado.',
            ], 404);
        }

        return response()->json([
            'ok'   => true,
            'data' => $anuncio,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────
    // STORE — create anuncio (profesores only)
    // ─────────────────────────────────────────────────────────────────────

    public function store(Request $request): JsonResponse
    {
        $usuario = $request->user();

        if ($usuario->getRol() !== 'profesor') {
            return response()->json([
                'ok'      => false,
                'mensaje' => 'Solo los profesores pueden publicar anuncios.',
            ], 403);
        }

        $data = $request->validate([
            'titulo'      => 'required|string|max:200',
            'asignatura'  => 'required|string|max:100',
            'nivel'       => 'required|in:primaria,eso,bachillerato,universidad,adultos,otro',
            'precio_hora' => 'required|numeric|min:1|max:500',
            'descripcion' => 'required|string|max:2000',
            // Disponibilidad opcional: si se envía, se valida y se guarda/reemplaza
            'disponibilidad'                   => 'sometimes|array|max:50',
            'disponibilidad.*.dia_semana'      => 'required_with:disponibilidad|integer|between:0,6',
            'disponibilidad.*.hora_inicio'     => 'required_with:disponibilidad|date_format:H:i',
            'disponibilidad.*.hora_fin'        => 'required_with:disponibilidad|date_format:H:i|after:disponibilidad.*.hora_inicio',
        ]);

        $profesor = Profesor::where('usuario_id', $usuario->id)->firstOrFail();

        $anuncio = Anuncio::create([
            'profesor_id' => $profesor->id,
            'titulo'      => $data['titulo'],
            'asignatura'  => $data['asignatura'],
            'nivel'       => $data['nivel'],
            'precio_hora' => $data['precio_hora'],
            'descripcion' => $data['descripcion'],
            'verificado'  => 'pendiente',
            'activo'      => true,
            'destacado'   => false,
        ]);

        // Guardar disponibilidad si se envió junto con el anuncio
        if (!empty($data['disponibilidad'])) {
            $this->guardarDisponibilidad($profesor->id, $data['disponibilidad']);
        }

        return response()->json([
            'ok'      => true,
            'mensaje' => 'Anuncio creado. Pendiente de verificación por el administrador.',
            'data'    => $anuncio->load('profesor.usuario'),
        ], 201);
    }

    // ─────────────────────────────────────────────────────────────────────
    // UPDATE — edit own anuncio
    // ─────────────────────────────────────────────────────────────────────

    public function update(Request $request, int $id): JsonResponse
    {
        $usuario = $request->user();
        $anuncio = Anuncio::find($id);

        if (! $anuncio) {
            return response()->json(['ok' => false, 'mensaje' => 'Anuncio no encontrado.'], 404);
        }

        // Must be the owner professor
        $profesor = Profesor::where('usuario_id', $usuario->id)->first();
        if (! $profesor || $anuncio->profesor_id !== $profesor->id) {
            return response()->json(['ok' => false, 'mensaje' => 'No tienes permiso para editar este anuncio.'], 403);
        }

        $data = $request->validate([
            'titulo'      => 'sometimes|string|max:200',
            'asignatura'  => 'sometimes|string|max:100',
            'nivel'       => 'sometimes|in:primaria,eso,bachillerato,universidad,adultos,otro',
            'precio_hora' => 'sometimes|numeric|min:1|max:500',
            'descripcion' => 'sometimes|string|max:2000',
            // Disponibilidad opcional al editar el anuncio
            'disponibilidad'                   => 'sometimes|array|max:50',
            'disponibilidad.*.dia_semana'      => 'required_with:disponibilidad|integer|between:0,6',
            'disponibilidad.*.hora_inicio'     => 'required_with:disponibilidad|date_format:H:i',
            'disponibilidad.*.hora_fin'        => 'required_with:disponibilidad|date_format:H:i|after:disponibilidad.*.hora_inicio',
        ]);

        // Editing resets verification to pending
        $data['verificado'] = 'pendiente';

        // Extraer disponibilidad antes de actualizar el anuncio
        $disponibilidad = $data['disponibilidad'] ?? null;
        unset($data['disponibilidad']);

        $anuncio->update($data);

        // Actualizar disponibilidad si se envió
        if (!is_null($disponibilidad)) {
            $this->guardarDisponibilidad($profesor->id, $disponibilidad);
        }

        return response()->json([
            'ok'      => true,
            'mensaje' => 'Anuncio actualizado. Pendiente de verificación.',
            'data'    => $anuncio->fresh()->load('profesor.usuario'),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────
    // DESTROY — deactivate own anuncio
    // ─────────────────────────────────────────────────────────────────────

    public function destroy(Request $request, int $id): JsonResponse
    {
        $usuario = $request->user();
        $anuncio = Anuncio::find($id);

        if (! $anuncio) {
            return response()->json(['ok' => false, 'mensaje' => 'Anuncio no encontrado.'], 404);
        }

        $profesor = Profesor::where('usuario_id', $usuario->id)->first();

        // Admins can also delete any anuncio
        $esAdmin = $usuario->getRol() === 'admin';
        $esOwner = $profesor && $anuncio->profesor_id === $profesor->id;

        if (! $esAdmin && ! $esOwner) {
            return response()->json(['ok' => false, 'mensaje' => 'No tienes permiso para eliminar este anuncio.'], 403);
        }

        $anuncio->update(['activo' => false]);

        return response()->json([
            'ok'      => true,
            'mensaje' => 'Anuncio desactivado correctamente.',
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Reemplaza todos los bloques de disponibilidad de un profesor.
     * Reutiliza la misma lógica que DisponibilidadController::save()
     * para garantizar consistencia, sin duplicar la validación de
     * solapamientos (ya prevenida en el frontend y en el controller dedicado).
     */
    private function guardarDisponibilidad(int $profesorId, array $bloques): void
    {
        DisponibilidadHoraria::where('profesor_id', $profesorId)->delete();

        foreach ($bloques as $bloque) {
            DisponibilidadHoraria::create([
                'profesor_id' => $profesorId,
                'dia_semana'  => $bloque['dia_semana'],
                'hora_inicio' => $bloque['hora_inicio'],
                'hora_fin'    => $bloque['hora_fin'],
                'activo'      => true,
            ]);
        }
    }
}
