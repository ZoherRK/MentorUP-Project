<?php

namespace App\Http\Controllers;

use App\Models\Alumno;
use App\Models\Anuncio;
use App\Models\Reserva;
use App\Models\Valoracion;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * CONTROLLER: ValoracionController
 *
 * GET  /api/valoraciones/pendientes → Reservas completadas sin valorar (alumno)
 * POST /api/valoraciones            → Leave a rating (alumno only, after a completed reserva)
 */
class ValoracionController extends Controller
{
    public function pendientes(Request $request): JsonResponse
    {
        $usuario = $request->user();

        if ($usuario->getRol() !== 'alumno') {
            return response()->json(['ok' => false, 'mensaje' => 'Solo para alumnos.'], 403);
        }

        $alumno = Alumno::where('usuario_id', $usuario->id)->firstOrFail();

        $yaValorados = Valoracion::where('alumno_id', $alumno->id)->pluck('anuncio_id');

        $reservas = Reserva::with(['anuncio.profesor.usuario'])
            ->where('alumno_id', $alumno->id)
            ->where('estado', 'completada')
            ->whereNotIn('anuncio_id', $yaValorados)
            ->get();

        return response()->json(['ok' => true, 'data' => $reservas]);
    }

    public function store(Request $request): JsonResponse
    {
        $usuario = $request->user();

        if ($usuario->getRol() !== 'alumno') {
            return response()->json([
                'ok'      => false,
                'mensaje' => 'Solo los alumnos pueden dejar valoraciones.',
            ], 403);
        }

        $data = $request->validate([
            'anuncio_id' => 'required|integer|exists:anuncios,id',
            'puntuacion' => 'required|integer|min:1|max:5',
            'comentario' => 'nullable|string|max:1000',
        ]);

        $alumno = Alumno::where('usuario_id', $usuario->id)->firstOrFail();

        // Must have a completed reserva for this anuncio
        $reservaCompletada = Reserva::where('alumno_id', $alumno->id)
            ->where('anuncio_id', $data['anuncio_id'])
            ->where('estado', 'completada')
            ->exists();

        if (! $reservaCompletada) {
            return response()->json([
                'ok'      => false,
                'mensaje' => 'Solo puedes valorar anuncios con clases completadas.',
            ], 422);
        }

        // One valoracion per alumno per anuncio
        $yaValorado = Valoracion::where('alumno_id', $alumno->id)
            ->where('anuncio_id', $data['anuncio_id'])
            ->exists();

        if ($yaValorado) {
            return response()->json([
                'ok'      => false,
                'mensaje' => 'Ya has valorado este anuncio.',
            ], 422);
        }

        $valoracion = Valoracion::create([
            'alumno_id'  => $alumno->id,
            'anuncio_id' => $data['anuncio_id'],
            'puntuacion' => $data['puntuacion'],
            'comentario' => $data['comentario'] ?? null,
        ]);

        return response()->json([
            'ok'      => true,
            'mensaje' => 'Valoración publicada. ¡Gracias!',
            'data'    => $valoracion,
        ], 201);
    }
}
