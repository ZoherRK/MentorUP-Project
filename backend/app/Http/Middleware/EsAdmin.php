<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * MIDDLEWARE: EsAdmin
 * Protects admin-only API routes.
 * Must be used AFTER auth:sanctum (so $request->user() is available).
 *
 * Returns 403 if the authenticated user does not have rol = 'admin'.
 */
class EsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $usuario = $request->user();

        if (! $usuario || $usuario->getRol() !== 'admin') {
            return response()->json([
                'ok'      => false,
                'mensaje' => 'Acceso denegado. Se requieren permisos de administrador.',
            ], 403);
        }

        return $next($request);
    }
}
