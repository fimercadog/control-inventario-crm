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
     * Procesa la petición asignando o reutilizando un X-Request-ID válido y configurándolo en Monolog.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $incomingRequestId = $request->header('X-Request-ID');
        $requestId = $this->isValidRequestId($incomingRequestId)
            ? (string) $incomingRequestId
            : (string) Str::uuid();

        // Inyectar en el contenedor de peticiones de Laravel
        $request->headers->set('X-Request-ID', $requestId);

        // Inyectar automáticamente en el contexto de Monolog para todas las llamadas a Log durante esta petición
        Log::withContext([
            'request_id' => $requestId,
        ]);

        /** @var Response $response */
        $response = $next($request);
        $response->headers->set('X-Request-ID', $requestId);

        return $response;
    }

    /**
     * Valida que el X-Request-ID sea seguro, alfanumérico/guiones y con longitud controlada (8 a 64 caracteres).
     */
    public function isValidRequestId(?string $requestId): bool
    {
        if (empty($requestId) || ! is_string($requestId)) {
            return false;
        }

        return preg_match('/^[a-zA-Z0-9\-_]{8,64}$/', $requestId) === 1;
    }
}
