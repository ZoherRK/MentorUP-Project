<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AnuncioController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\ValoracionController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\DisponibilidadController;

/*
|--------------------------------------------------------------------------
| API Routes — MentorUP
|--------------------------------------------------------------------------
|
| Auth: Laravel Sanctum (Bearer token)
|   - Rutas públicas:  register, login, listado/detalle anuncios,
|                      disponibilidad pública de profesores
|   - Rutas protegidas: requieren 'auth:sanctum'
|   - Rutas admin:      requieren 'auth:sanctum' + 'es.admin'
|
*/

// ── PUBLIC: Auth ──────────────────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// ── PUBLIC: Anuncios (solo lectura) ───────────────────────────────────────
Route::get('/anuncios',      [AnuncioController::class, 'index']);
Route::get('/anuncios/{id}', [AnuncioController::class, 'show']);

// ── PUBLIC: Disponibilidad de profesores (para que alumnos la consulten) ──
Route::get('/profesores/{profesorId}/disponibilidad', [DisponibilidadController::class, 'publicShow']);
Route::post('/profesores/{profesorId}/verificar-fecha', [DisponibilidadController::class, 'verificarFecha']);
Route::get('/profesores/{profesorId}/slots', [DisponibilidadController::class, 'slotsLibres']);

// ── PROTECTED: Require valid Sanctum token ────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout',  [AuthController::class, 'logout']);
    Route::get('/me',       [AuthController::class, 'me']);
    Route::put('/me',       [AuthController::class, 'updateProfile']);

    // Anuncios (CRUD para profesores)
    Route::post('/anuncios',         [AnuncioController::class, 'store']);
    Route::put('/anuncios/{id}',     [AnuncioController::class, 'update']);
    Route::delete('/anuncios/{id}',  [AnuncioController::class, 'destroy']);

    // Reservas
    Route::get('/reservas',                     [ReservaController::class, 'index']);
    Route::post('/reservas',                    [ReservaController::class, 'store']);
    Route::post('/reservas/{id}/cancelar',      [ReservaController::class, 'cancelar']);
    Route::put('/reservas/{id}/confirmar',      [ReservaController::class, 'confirmar']);
    Route::put('/reservas/{id}/completar',      [ReservaController::class, 'completar']);

    // Valoraciones
    Route::get('/valoraciones/pendientes', [ValoracionController::class, 'pendientes']);
    Route::post('/valoraciones', [ValoracionController::class, 'store']);

    // Disponibilidad horaria (solo profesores)
    Route::get('/disponibilidad',  [DisponibilidadController::class, 'index']);
    Route::post('/disponibilidad', [DisponibilidadController::class, 'save']);

});

// ── ADMIN: Require valid token + admin role ───────────────────────────────
Route::middleware(['auth:sanctum', 'es.admin'])->prefix('admin')->group(function () {

    // Dashboard stats
    Route::get('/stats', [AdminController::class, 'stats']);

    // Anuncios
    Route::get('/anuncios',                    [AdminController::class, 'anuncios']);
    Route::put('/anuncios/{id}/verificar',     [AdminController::class, 'verificarAnuncio']);
    Route::delete('/anuncios/{id}',            [AdminController::class, 'eliminarAnuncio']);

    // Usuarios
    Route::get('/alumnos',                     [AdminController::class, 'alumnos']);
    Route::get('/profesores',                  [AdminController::class, 'profesores']);
    Route::put('/usuarios/{id}/bloquear',      [AdminController::class, 'bloquearUsuario']);
    Route::delete('/usuarios/{id}',            [AdminController::class, 'eliminarUsuario']);

});