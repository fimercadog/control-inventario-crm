<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;

class SupportPayloadService
{
    /**
     * Construye una estructura DTO desacoplada y reutilizable para reportes de soporte y diagnóstico.
     *
     * @param  array<string, mixed>  $extraContext
     * @return array<string, mixed>
     */
    public function buildPayload(Request $request, ?string $message = null, array $extraContext = []): array
    {
        $user = $request->user();
        $staffUser = $user instanceof User ? $user : null;

        return [
            'request_id' => $request->header('X-Request-ID') ?: (string) \Illuminate\Support\Str::uuid(),
            'timestamp' => now()->toIso8601String(),
            'app_version' => config('app.version', '1.0.0'),
            'environment' => config('app.env', 'production'),
            'user' => [
                'id' => $staffUser?->id,
                'email' => (new LogSanitizer)->maskEmail($staffUser?->email),
                'role' => $staffUser?->roles?->first()?->name,
            ],
            'company' => [
                'id' => $staffUser?->company_id,
                'name' => $staffUser?->company?->name,
            ],
            'context' => [
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ],
            'feedback_message' => $message,
            'meta' => (new LogSanitizer)->sanitize($extraContext),
        ];
    }
}
