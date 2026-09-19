<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class RequestIdMiddleware
{
    /**
     * Procesa la petición asignando o reutilizando un Request-ID válido y configurándolo en Monolog.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $headerName = config('observability.request_header', 'X-Request-ID');
        $incomingRequestId = $request->header($headerName);

        $requestId = $this->isValidRequestId($incomingRequestId)
            ? (string) $incomingRequestId
            : (string) Str::uuid();

        // Inyectar en el contenedor de peticiones de Laravel
        $request->headers->set($headerName, $requestId);

        // Inyectar automáticamente en el contexto de Monolog para todas las llamadas a Log durante esta petición
        Log::withContext([
            'request_id' => $requestId,
        ]);

        /** @var Response $response */
        $response = $next($request);
        $response->headers->set($headerName, $requestId);

        return $response;
    }

    /**
     * Valida que el Request-ID sea seguro, alfanumérico/guiones y con longitud controlada.
     */
    public function isValidRequestId(?string $requestId): bool
    {
        if (empty($requestId) || ! is_string($requestId)) {
            return false;
        }

        $min = config('observability.min_id_length', 8);
        $max = config('observability.max_id_length', 64);

        return preg_match('/^[a-zA-Z0-9\-_]{'.$min.','.$max.'}$/', $requestId) === 1;
    }
}
