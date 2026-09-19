<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Enlace de acceso al portal del dueño (S14). No es un reset de password: es el único método de login. */
class ClientMagicLinkNotification extends Notification
{
    public function __construct(private readonly string $url) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Tu enlace de acceso al portal')
            ->line('Usa este enlace para entrar a tu portal y ver o gestionar tus citas y tratamientos.')
            ->action('Entrar a mi portal', $this->url)
            ->line('El enlace vence en 15 minutos. Si no lo pediste vos, podés ignorar este correo.');
    }
}
