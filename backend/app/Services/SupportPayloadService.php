<?php

namespace App\Services;

use Illuminate\Http\Request;

class SupportPayloadService
{
    protected ObservabilityService $observability;

    public function __construct(?ObservabilityService $observability = null)
    {
        $this->observability = $observability ?? new ObservabilityService;
    }

    /**
     * Construye una estructura DTO desacoplada y reutilizable para reportes de soporte y diagnóstico.
     *
     * @param  array<string, mixed>  $extraContext
     * @return array<string, mixed>
     */
    public function buildPayload(Request $request, ?string $message = null, array $extraContext = []): array
    {
        return $this->observability->buildSupportPayload($request, $message, $extraContext);
    }
}
