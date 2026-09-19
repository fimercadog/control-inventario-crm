<?php

$verticalConfig = file_exists(__DIR__.'/observability-vertical.php')
    ? require __DIR__.'/observability-vertical.php'
    : [];

return [

    /*
    |--------------------------------------------------------------------------
    | Versión del Módulo de Observabilidad (Core Inmutable)
    |--------------------------------------------------------------------------
    |
    | Identificador de versión del núcleo transversal de observabilidad.
    | Este archivo NO debe ser modificado por las verticales.
    |
    */
    'version' => '1.0.1',

    /*
    |--------------------------------------------------------------------------
    | Configuración Base Global Core
    |--------------------------------------------------------------------------
    */

    // Nombre de la cabecera HTTP para la correlación de solicitudes
    'request_header' => env('OBSERVABILITY_REQUEST_HEADER', 'X-Request-ID'),

    // Rangos de validación para el Request ID provisto por el cliente
    'min_id_length' => 8,
    'max_id_length' => 64,

    // Retención predeterminada de logs diarios técnicos (en días)
    'retention_days' => env('LOG_DAILY_DAYS', 30),

    // Campos sensibles globales para sanitización recursiva de logs y payloads
    'sensitive_fields' => [
        'password',
        'password_confirmation',
        'current_password',
        'new_password',
        'credit_card',
        'card_number',
        'cvv',
        'cvc',
        'ssn',
        'auth_token',
        'token',
        'secret',
        'api_key',
        'private_key',
        'access_token',
        'refresh_token',
    ],

    // Eventos de seguridad y diagnóstico habilitados
    'events' => array_merge([
        'login_failed' => true,
        'forbidden' => true,
        'rate_limit' => true,
        'server_error' => true,
    ], $verticalConfig['custom_events'] ?? []),

    // Integración futura con Sentry o servicios APM externos
    'sentry' => [
        'enabled' => env('SENTRY_ENABLED', false),
        'dsn' => env('SENTRY_DSN', null),
        'traces_sample_rate' => env('SENTRY_TRACES_SAMPLE_RATE', 0.1),
    ],

    /*
    |--------------------------------------------------------------------------
    | Extensiones Combinadas de la Vertical
    |--------------------------------------------------------------------------
    */
    'vertical_extensions' => [
        'additional_sensitive_fields' => $verticalConfig['additional_sensitive_fields'] ?? [],
        'custom_events' => $verticalConfig['custom_events'] ?? [],
        'module_name' => $verticalConfig['module_name'] ?? env('OBSERVABILITY_MODULE_NAME', 'core_erp'),
    ],

];
