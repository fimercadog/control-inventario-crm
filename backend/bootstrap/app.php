<?php

use App\Http\Middleware\EnsurePlanFeature;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
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
        $middleware->append(SecurityHeaders::class);
        $middleware->alias(['plan' => EnsurePlanFeature::class]);
        $middleware->redirectGuestsTo(fn (Request $request) => $request->is('api/*') ? null : route('login'));
        // Cookie httpOnly de sesion en vez de bearer token: habilita CSRF +
        // auth por cookie para los dominios en SANCTUM_STATEFUL_DOMAINS.
        $middleware->statefulApi();
        // Formularios publicos del sitio (sin sesion): la proteccion es el
        // throttle por IP, no el token CSRF de una sesion que no existe.
        $middleware->validateCsrfTokens(except: ['api/public/*']);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (AuthenticationException $exception, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            return null;
        });

        // 404 de la API sin filtrar internos (nombres de clase de modelo en el
        // mensaje de route-model binding).
        $exceptions->render(function (NotFoundHttpException $exception, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Recurso no encontrado.'], 404);
            }

            return null;
        });

        // Red de seguridad de la API: ninguna respuesta de error debe llevar
        // stack trace, rutas del disco, usuario del SO ni clases internas del
        // framework — ni siquiera con APP_DEBUG=true (la depuracion local vive
        // en storage/logs, no en el cuerpo HTTP). Las de validacion (422) ya
        // salen saneadas por Laravel (solo message + errors), se dejan pasar.
        $exceptions->render(function (Throwable $e, Request $request) {
            if (! $request->is('api/*') || $e instanceof ValidationException) {
                return null;
            }

            if ($e instanceof HttpExceptionInterface) {
                // Se conserva el status real y las cabeceras utiles (Retry-After
                // en 429/503, Allow en 405). El mensaje del 4xx ya esta pensado
                // para el cliente; el de un 5xx puede filtrar internos -> generico.
                $status = $e->getStatusCode();

                return response()->json(
                    ['message' => $status < 500 ? ($e->getMessage() ?: 'Solicitud no valida.') : 'Error interno del servidor.'],
                    $status,
                    $e->getHeaders(),
                );
            }

            report($e);

            return response()->json(['message' => 'Error interno del servidor.'], 500);
        });
    })->create();
