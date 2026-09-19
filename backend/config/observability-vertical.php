<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Extensiones por Vertical - Master / Main ERP
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
        'system_deployment' => true,
    ],

    'module_name' => 'master_erp',

];
