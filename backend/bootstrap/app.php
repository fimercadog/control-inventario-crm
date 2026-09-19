<?php

use App\Http\Middleware\RequestIdMiddleware;
use App\Http\Middleware\SecurityHeaders;
use App\Models\User;
use App\Services\LogSanitizer;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append(RequestIdMiddleware::class);
        $middleware->append(SecurityHeaders::class);
        $middleware->redirectGuestsTo(fn (Request $request) => $request->is('api/*') ? null : route('login'));
        $middleware->statefulApi();
        $middleware->validateCsrfTokens(except: ['api/public/*', 'api/portal/login']);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->dontReportDuplicates();
        $exceptions->reportable(function (Throwable $e) {
            return false;
        });

        $exceptions->render(function (AuthenticationException $exception, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            return null;
        });

        $exceptions->render(function (NotFoundHttpException $exception, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Recurso no encontrado.'], 404);
            }

            return null;
        });

        // 403 Forbidden: Registrar evento técnico de seguridad
        $exceptions->render(function (AuthorizationException|AccessDeniedHttpException $e, Request $request) {
            $user = $request->user();
            $staffUser = $user instanceof User ? $user : null;

            Log::warning('Acceso denegado (403)', [
                'request_id' => $request->header('X-Request-ID'),
                'user_id' => $staffUser?->id,
                'company_id' => $staffUser?->company_id,
                'path' => $request->path(),
                'method' => $request->method(),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'message' => $e->getMessage() ?: 'Acceso no autorizado.',
            ]);

            if ($request->is('api/*')) {
                return response()->json(['message' => 'Acceso no autorizado.'], 403);
            }

            return null;
        });

        // Red de seguridad de la API: 429 Throttle y 5xx con contexto técnico y sanitización estricta
        $exceptions->render(function (Throwable $e, Request $request) {
            if (! $request->is('api/*') || $e instanceof ValidationException) {
                return null;
            }

            $user = $request->user();
            $staffUser = $user instanceof User ? $user : null;
            $context = [
                'request_id' => $request->header('X-Request-ID'),
                'user_id' => $staffUser?->id,
                'company_id' => $staffUser?->company_id,
                'path' => $request->path(),
                'method' => $request->method(),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ];

            if ($e instanceof HttpExceptionInterface) {
                $status = $e->getStatusCode();

                if ($status === 403) {
                    Log::warning('Acceso denegado (403)', array_merge($context, ['message' => $e->getMessage()]));

                    return response()->json(['message' => 'Acceso no autorizado.'], 403, $e->getHeaders());
                }

                if ($status === 429) {
                    Log::warning('Demasiadas solicitudes (429)', array_merge($context, [
                        'message' => 'Límite de solicitudes superado.',
                        'retry_after' => $e->getHeaders()['Retry-After'] ?? null,
                    ]));

                    return response()->json(['message' => 'Demasiadas solicitudes.'], 429, $e->getHeaders());
                }

                if ($status >= 500) {
                    Log::error('Error HTTP interno ('.$status.')', array_merge($context, [
                        'exception_class' => get_class($e),
                        'exception_message' => $e->getMessage(),
                        'file' => $e->getFile(),
                        'line' => $e->getLine(),
                    ]));

                    return response()->json(['message' => 'Error interno del servidor.'], $status, $e->getHeaders());
                }

                return response()->json(
                    ['message' => $e->getMessage() ?: 'Solicitud no válida.'],
                    $status,
                    $e->getHeaders(),
                );
            }

            // Excepción 500 no controlada: guardar stack trace técnico pero JAMÁS el payload o datos sensibles
            Log::error('Error interno no controlado (500)', array_merge($context, [
                'exception_class' => get_class($e),
                'exception_message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace_summary' => collect($e->getTrace())->take(5)->map(fn ($frame) => [
                    'file' => $frame['file'] ?? 'unknown',
                    'line' => $frame['line'] ?? 0,
                    'function' => ($frame['class'] ?? '').($frame['type'] ?? '').($frame['function'] ?? ''),
                ])->all(),
            ]));

            return response()->json(['message' => 'Error interno del servidor.'], 500);
        });
    })->create();
