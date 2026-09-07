<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // FRONTEND_URL + cualquier dominio extra en CORS_EXTRA_ORIGINS
    // (separados por coma). Sin dominios de otros proyectos hardcodeados.
    'allowed_origins' => array_values(array_filter(array_merge(
        [env('FRONTEND_URL', 'http://localhost:3000'), 'http://localhost:3000'],
        array_map('trim', explode(',', (string) env('CORS_EXTRA_ORIGINS', ''))),
    ))),

    'allowed_origins_patterns' => [
        '#^https://.*\.ngrok-free\.(dev|app)$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
