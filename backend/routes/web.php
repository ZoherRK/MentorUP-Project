<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| MentorUP is a decoupled SPA — the React frontend handles all UI.
| The backend only exposes API routes (see routes/api.php).
|
| These web routes serve:
|   /          → Welcome/landing blade (useful for health checks & SEO)
|   /inicio    → Main home page (required by project spec)
|
*/

// Root — redirect to /inicio
Route::get('/', function () {
    return redirect('/inicio');
});

// /inicio — main home page entry point
Route::get('/inicio', function () {
    return view('inicio');
})->name('inicio');

// Fallback for any other web route — returns welcome view
Route::fallback(function () {
    return view('welcome');
});
