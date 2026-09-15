<?php

// Configuracion del motor de disponibilidad del portal publico "Agendar cita"
// (S13). ponytail: horario fijo global en vez de configurable por empresa/dia
// -- si una clinica real necesita horarios distintos por dia o por
// veterinario, esto pasa a una tabla (ver docs/roadmap-veterinaria.md S13).
return [
    'business_hours' => [
        'start' => '08:00',
        'end' => '18:00',
    ],
    // ISO-8601: lunes=1 ... domingo=7. Domingo cerrado por defecto.
    'business_days' => [1, 2, 3, 4, 5, 6],
    'slot_step_minutes' => 30,
    'default_duration_minutes' => 30,
    'min_notice_minutes' => 60,
    'max_days_ahead' => 30,
];
