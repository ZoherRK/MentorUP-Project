<?php

namespace App\Http\Controllers;

use App\Models\Anuncio;
use App\Models\Alumno;
use App\Models\Profesor;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * CONTROLLER: AdminController
 *
 * All routes here are protected by auth:sanctum + es.admin middleware.
 *
 * GET  /api/admin/stats                      → Dashboard statistics
 * GET  /api/admin/anuncios                   → All anuncios (filterable by estado)
 * PUT  /api/admin/anuncios/{id}/verificar    → Approve or reject an anuncio
 * DELETE /api/admin/anuncios/{id}            → Hard delete anuncio
 * GET  /api/admin/alumnos                    → All alumnos
 * GET  /api/admin/profesores                 → All profesores
 * PUT  /api/admin/usuarios/{id}/bloquear     → Block/unblock a user
 * DELETE /api/admin/usuarios/{id}            → Delete a user permanently
 */
class AdminController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────
    // STATS
    // ─────────────────────────────────────────────────────────────────────

    public function stats(): JsonResponse
    {
        return response()->json([
            'ok'   => true,
            'data' => [
                'anuncios_pendientes'  => Anuncio::where('verificado', 'pendiente')->count(),
                'anuncios_aprobados'   => Anuncio::where('verificado', 'aprobado')->count(),
                'anuncios_rechazados'  => Anuncio::where('verificado', 'rechazado')->count(),
                'total_alumnos'        => Alumno::count(),
                'total_profesores'     => Profesor::count(),
                'usuarios_bloqueados'  => Usuario::where('bloqueado', true)->count(),
                'total_usuarios'       => Usuario::count(),
            ],
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────
    // ANUNCIOS (list all for admin, filterable)
    // ─────────────────────────────────────────────────────────────────────

    public function anuncios(Request $request): JsonResponse
    {
        $query = Anuncio::with(['profesor.usuario']);

        if ($request->filled('estado')) {
            $query->where('verificado', $request->estado);
        }

        $anuncios = $query->orderByDesc('created_at')->paginate(20);

        return response()->json(['ok' => true, 'data' => $anuncios]);
    }

    // ─────────────────────────────────────────────────────────────────────
    // VERIFICAR ANUNCIO (approve / reject)
    // ─────────────────────────────────────────────────────────────────────

    public function verificarAnuncio(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'accion' => 'required|in:aprobado,rechazado',
        ]);

        $anuncio = Anuncio::find($id);

        if (! $anuncio) {
            return response()->json(['ok' => false, 'mensaje' => 'Anuncio no encontrado.'], 404);
        }

        $anuncio->update(['verificado' => $data['accion']]);

        $texto = $data['accion'] === 'aprobado' ? 'aprobado' : 'rechazado';

        return response()->json([
            'ok'      => true,
            'mensaje' => "Anuncio {$texto} correctamente.",
            'data'    => $anuncio,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────
    // ELIMINAR ANUNCIO
    // ─────────────────────────────────────────────────────────────────────

    public function eliminarAnuncio(int $id): JsonResponse
    {
        $anuncio = Anuncio::find($id);

        if (! $anuncio) {
            return response()->json(['ok' => false, 'mensaje' => 'Anuncio no encontrado.'], 404);
        }

        $anuncio->delete();

        return response()->json(['ok' => true, 'mensaje' => 'Anuncio eliminado.']);
    }

    // ─────────────────────────────────────────────────────────────────────
    // ALUMNOS
    // ─────────────────────────────────────────────────────────────────────

    public function alumnos(): JsonResponse
    {
        $alumnos = Usuario::whereHas('alumno')
            ->select('id', 'nombre', 'apellidos', 'email', 'ciudad', 'bloqueado', 'created_at')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['ok' => true, 'data' => $alumnos]);
    }

    // ─────────────────────────────────────────────────────────────────────
    // PROFESORES
    // ─────────────────────────────────────────────────────────────────────

    public function profesores(): JsonResponse
    {
        $profesores = Usuario::whereHas('profesor')
            ->withCount(['profesor as total_anuncios' => function ($q) {
                $q->join('anuncios', 'profesores.id', '=', 'anuncios.profesor_id');
            }])
            ->select('id', 'nombre', 'apellidos', 'email', 'ciudad', 'bloqueado', 'created_at')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['ok' => true, 'data' => $profesores]);
    }

    // ─────────────────────────────────────────────────────────────────────
    // BLOQUEAR / DESBLOQUEAR USUARIO
    // ─────────────────────────────────────────────────────────────────────

    public function bloquearUsuario(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'bloqueado' => 'required|boolean',
        ]);

        $usuario = Usuario::find($id);

        if (! $usuario) {
            return response()->json(['ok' => false, 'mensaje' => 'Usuario no encontrado.'], 404);
        }

        // Prevent admin from blocking themselves
        if ($usuario->id === $request->user()->id) {
            return response()->json(['ok' => false, 'mensaje' => 'No puedes bloquearte a ti mismo.'], 422);
        }

        $usuario->update(['bloqueado' => $data['bloqueado']]);

        $accion = $data['bloqueado'] ? 'bloqueado' : 'desbloqueado';

        return response()->json([
            'ok'      => true,
            'mensaje' => "Usuario {$accion} correctamente.",
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────
    // ELIMINAR USUARIO
    // ─────────────────────────────────────────────────────────────────────

    public function eliminarUsuario(Request $request, int $id): JsonResponse
    {
        $usuario = Usuario::find($id);

        if (! $usuario) {
            return response()->json(['ok' => false, 'mensaje' => 'Usuario no encontrado.'], 404);
        }

        if ($usuario->id === $request->user()->id) {
            return response()->json(['ok' => false, 'mensaje' => 'No puedes eliminar tu propia cuenta.'], 422);
        }

        if ($usuario->getRol() === 'admin') {
            return response()->json(['ok' => false, 'mensaje' => 'No se puede eliminar a otro administrador.'], 422);
        }

        // Cascade: tokens, anuncios, reservas, etc. handled by FK constraints
        $usuario->tokens()->delete();
        $usuario->delete();

        return response()->json(['ok' => true, 'mensaje' => 'Usuario eliminado correctamente.']);
    }
}
