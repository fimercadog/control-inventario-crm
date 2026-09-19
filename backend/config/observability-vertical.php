<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Extensiones por Vertical - Recursos Humanos / RRHH
    |--------------------------------------------------------------------------
    */

    'additional_sensitive_fields' => [
        'payroll_details',
        'base_salary',
        'bank_account_number',
        'employment_contract',
        'social_security_id',
        'labor_documents',
    ],

    'custom_events' => [
        'payroll_generated' => true,
        'contract_signed' => true,
    ],

    'module_name' => 'recursos_humanos',

];
