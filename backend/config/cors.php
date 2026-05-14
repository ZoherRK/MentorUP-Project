<?php

return [

    /*
    |--------------------------------------------------------------------------
    | CORS Configuration — MentorUP
    |--------------------------------------------------------------------------
    |
    | Allows the React frontend (Vite dev server on :5173) to call the
    | Laravel API. In production, replace with the real frontend domain.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:5173'),
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Must be true for Sanctum cookie-based auth (SPA mode).
    // For token-based auth (Bearer) this can be false.
    'supports_credentials' => true,

];
