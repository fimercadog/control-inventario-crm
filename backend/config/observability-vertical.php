<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Extensiones por Vertical - Base ERP Core
    |--------------------------------------------------------------------------
    |
    | Este archivo es el único lugar permitido para personalizaciones por vertical.
    | Permite agregar campos sensibles, eventos personalizados y definir el
    | nombre del módulo sin tocar el núcleo inmutable config/observability.php.
    |
    */

    'additional_sensitive_fields' => [
        'financial_documents',
        'bank_accounts',
        'api_secrets',
        'tax_id',
    ],

    'custom_events' => [
        'audit_log_purged' => true,
    ],

    'module_name' => 'core_erp',

];
