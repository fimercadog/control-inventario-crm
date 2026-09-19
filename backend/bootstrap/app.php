<?php

use App\Http\Middleware\RequestIdMiddleware;
use App\Http\Middleware\SecurityHeaders;
use App\Services\ObservabilityService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

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
        $exceptions->reportable(fn (Throwable $e) => false);

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

        $exceptions->render(function (AuthorizationException|AccessDeniedHttpException $e, Request $request) {
            app(ObservabilityService::class)->logSecurityEvent('403_forbidden', $request, [
                'message' => $e->getMessage() ?: 'Acceso no autorizado.',
            ]);

            if ($request->is('api/*')) {
                return response()->json(['message' => 'Acceso no autorizado.'], 403);
            }

            return null;
        });

        $exceptions->render(function (Throwable $e, Request $request) {
            if (! $request->is('api/*') || $e instanceof ValidationException) {
                return null;
            }

            $observability = app(ObservabilityService::class);

            if ($e instanceof HttpExceptionInterface) {
                $status = $e->getStatusCode();

                if ($status === 403) {
                    $observability->logSecurityEvent('403_forbidden', $request, ['message' => $e->getMessage()]);

                    return response()->json(['message' => 'Acceso no autorizado.'], 403, $e->getHeaders());
                }

                if ($status === 429) {
                    $observability->logSecurityEvent('429_throttle', $request, [
                        'message' => 'Límite de solicitudes superado.',
                        'retry_after' => $e->getHeaders()['Retry-After'] ?? null,
                    ]);

                    return response()->json(['message' => 'Demasiadas solicitudes.'], 429, $e->getHeaders());
                }

                if ($status >= 500) {
                    $observability->logUnhandledError($e, $request);

                    return response()->json(['message' => 'Error interno del servidor.'], $status, $e->getHeaders());
                }

                return response()->json(
                    ['message' => $status < 500 ? ($e->getMessage() ?: 'Solicitud no valida.') : 'Error interno del servidor.'],
                    $status,
                    $e->getHeaders(),
                );
            }

            $observability->logUnhandledError($e, $request);

            return response()->json(['message' => 'Error interno del servidor.'], 500);
        });
    })->create();
