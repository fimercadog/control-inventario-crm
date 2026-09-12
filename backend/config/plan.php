<?php

// Escalon comercial de este despliegue. Mismo mecanismo que el frontend
// (frontend/src/lib/plan.ts): un despliegue = un plan. Ver docs/low-ticket.md.
//
//   PLAN_TIER sin definir           -> low_ticket (default de esta rama).
//   PLAN_TIER=pro | premium | full  -> habilita los modulos de ese escalon
//                                       ("full" se trata como premium).
return [
    'tier' => env('PLAN_TIER', 'low_ticket') === 'full' ? 'premium' : env('PLAN_TIER', 'low_ticket'),
];
