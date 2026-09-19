<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Extensiones por Vertical - CareNote / Expedientes Clínicos Inteligentes
    |--------------------------------------------------------------------------
    */

    'additional_sensitive_fields' => [
        'clinical_notes',
        'encounter_transcript',
        'audio_file_path',
        'patient_medical_history',
        'ai_summary_raw',
    ],

    'custom_events' => [
        'encounter_ingested' => true,
        'transcript_processed' => true,
    ],

    'module_name' => 'carenote_health',

];
