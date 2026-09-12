<?php

namespace App\Http\Middleware;

use App\Support\Plan\Feature;
use App\Support\Plan\PlanService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Gate de plan comercial en la API: aunque un modulo este oculto en el
 * frontend, la ruta se rechaza igual si este despliegue no lo incluye. Se
 * declara junto al `can:` de permisos existente, ej.
 * ->middleware(['can:deals.manage', 'plan:crm_pro']).
 */
class EnsurePlanFeature
{
    public function __construct(private readonly PlanService $plan) {}

    public function handle(Request $request, Closure $next, string $feature): Response
    {
        if (! $this->plan->has(Feature::from($feature))) {
            abort(403, 'Este modulo no esta incluido en tu plan.');
        }

        return $next($request);
    }
}
