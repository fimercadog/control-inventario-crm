<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(function ($notifiable, string $token) {
            $frontendUrl = rtrim(config('app.frontend_url'), '/');

            return "{$frontendUrl}/reset-password?token={$token}&email=" . urlencode($notifiable->getEmailForPasswordReset());
        });

        // Limiters con nombre => cada uno tiene su propio contador. Sin esto, el
        // `throttle:X,Y` dinamico comparte bucket por (dominio, IP): navegar el
        // catalogo (muchos GET) agota la cuota antes de poder cotizar.
        RateLimiter::for('catalog-read', fn (Request $request) => Limit::perMinute(120)->by('catalog-read:'.$request->ip()));
        RateLimiter::for('catalog-quote', fn (Request $request) => Limit::perMinute(5)->by('catalog-quote:'.$request->ip()));
    }
}
