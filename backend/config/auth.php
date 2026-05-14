<?php

return [

    'defaults' => [
        'guard'     => 'web',
        'passwords' => 'usuarios',
    ],

    'guards' => [
        'web' => [
            'driver'   => 'session',
            'provider' => 'usuarios',
        ],

        // Sanctum uses this guard for API token authentication
        'sanctum' => [
            'driver'   => 'sanctum',
            'provider' => 'usuarios',
        ],
    ],

    'providers' => [
        // MentorUP uses the 'usuarios' table and Usuario model
        'usuarios' => [
            'driver' => 'eloquent',
            'model'  => App\Models\Usuario::class,
        ],
    ],

    'passwords' => [
        'usuarios' => [
            'provider' => 'usuarios',
            'table'    => 'password_reset_tokens',
            'expire'   => 60,
            'throttle' => 60,
        ],
    ],

    'password_timeout' => 10800,

];
