<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Extensiones por Vertical - IPS / Salud Integral
    |--------------------------------------------------------------------------
    */

    'additional_sensitive_fields' => [
        'clinical_history',
        'medical_notes',
        'diagnosis',
        'treatment_plan',
        'prescription_details',
        'patient_id_number',
        'health_insurance_number',
    ],

    'custom_events' => [
        'medical_record_accessed' => true,
    ],

    'module_name' => 'ips_salud',

];
