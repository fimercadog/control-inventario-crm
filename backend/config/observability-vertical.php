<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Extensiones por Vertical (Personalización Local)
    |--------------------------------------------------------------------------
    |
    | Este archivo es el único lugar permitido para personalizaciones por vertical.
    | Permite agregar campos sensibles, eventos personalizados y definir el
    | nombre del módulo sin tocar el núcleo inmutable config/observability.php.
    |
    */

    'additional_sensitive_fields' => [],

    'custom_events' => [],

    'module_name' => env('OBSERVABILITY_MODULE_NAME', 'core_erp'),

];
