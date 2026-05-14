<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\Alumno;
use App\Models\Profesor;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

/**
 * CONTROLLER: AuthController
 *
 * POST /api/register  → Crea cuenta (alumno o profesor)
 * POST /api/login     → Devuelve Bearer token + objeto usuario
 * POST /api/logout    → Revoca el token actual
 * GET  /api/me        → Devuelve el usuario autenticado
 * PUT  /api/me        → Actualiza datos del perfil
 */
class AuthController extends Controller
{
    // ── REGISTER ──────────────────────────────────────────────────────────

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nombre'    => 'required|string|max:100',
            'apellidos' => 'required|string|max:150',
            'email'     => 'required|email|unique:usuarios,email',
            'password'  => 'required|string|min:8|confirmed',
            'rol'       => 'required|in:alumno,profesor',
            'telefono'  => 'nullable|string|max:20',
        ]);

        $usuario = Usuario::create([
            'nombre'    => $data['nombre'],
            'apellidos' => $data['apellidos'],
            'email'     => $data['email'],
            'password'  => $data['password'],
            'telefono'  => $data['telefono'] ?? null,
            'bloqueado' => false,
        ]);

        if ($data['rol'] === 'profesor') {
            Profesor::create(['usuario_id' => $usuario->id]);
        } else {
            Alumno::create(['usuario_id' => $usuario->id]);
        }

        $token = $usuario->createToken('api-token')->plainTextToken;

        return response()->json([
            'ok'      => true,
            'mensaje' => 'Cuenta creada correctamente.',
            'token'   => $token,
            'usuario' => $usuario->toApiArray(),
        ], 201);
    }

    // ── LOGIN ─────────────────────────────────────────────────────────────

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $usuario = Usuario::where('email', $data['email'])->first();

        if (!$usuario || !Hash::check($data['password'], $usuario->password)) {
            return response()->json(['ok' => false, 'mensaje' => 'Credenciales incorrectas.'], 401);
        }

        if ($usuario->bloqueado) {
            return response()->json(['ok' => false, 'mensaje' => 'Tu cuenta ha sido bloqueada. Contacta con el soporte.'], 403);
        }

        $usuario->tokens()->delete();
        $token = $usuario->createToken('api-token')->plainTextToken;

        return response()->json([
            'ok'      => true,
            'mensaje' => 'Sesión iniciada correctamente.',
            'token'   => $token,
            'usuario' => $usuario->toApiArray(),
        ]);
    }

    // ── LOGOUT ────────────────────────────────────────────────────────────

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['ok' => true, 'mensaje' => 'Sesión cerrada correctamente.']);
    }

    // ── ME ────────────────────────────────────────────────────────────────

    public function me(Request $request): JsonResponse
    {
        return response()->json(['ok' => true, 'usuario' => $request->user()->toApiArray()]);
    }

    // ── UPDATE PROFILE ────────────────────────────────────────────────────

    public function updateProfile(Request $request): JsonResponse
    {
        $usuario = $request->user();

        $data = $request->validate([
            'nombre'    => 'sometimes|string|max:100',
            'apellidos' => 'sometimes|string|max:150',
            'telefono'  => 'nullable|string|max:20',
            'password'  => 'nullable|string|min:8|confirmed',
        ]);

        if (!empty($data['password'])) {
            $usuario->password = $data['password'];
            unset($data['password'], $data['password_confirmation']);
        }

        $usuario->fill(array_filter($data, fn($v) => $v !== null));
        $usuario->save();

        return response()->json([
            'ok'      => true,
            'mensaje' => 'Perfil actualizado correctamente.',
            'usuario' => $usuario->toApiArray(),
        ]);
    }
}
