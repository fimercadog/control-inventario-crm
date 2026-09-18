<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ValidateBotSecretToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $expectedSecret = config('services.carenote_bot.secret', env('CARENOTE_BOT_SECRET', 'carenote-bot-secret-dev-2026'));
        
        $token = $request->header('X-CareNote-Bot-Secret');
        
        if (! $token && $request->hasHeader('Authorization')) {
            $header = $request->header('Authorization');
            if (str_starts_with($header, 'Bearer ')) {
                $token = substr($header, 7);
            }
        }

        if (! $token || ! hash_equals((string) $expectedSecret, (string) $token)) {
            return response()->json([
                'error' => 'UNAUTHORIZED_BOT_TOKEN',
                'message' => 'Token de servicio de bot inválido o no configurado.',
            ], 401);
        }

        return $next($request);
    }
}
