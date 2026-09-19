<?php

namespace App\Services;

class LogSanitizer
{
    /**
     * Claves sensibles combinadas (base global + extensiones de la vertical).
     *
     * @var array<int, string>
     */
    protected array $sensitiveKeys;

    public function __construct()
    {
        $baseKeys = config('observability.sensitive_fields', [
            'password',
            'password_confirmation',
            'credit_card',
            'card_number',
            'cvv',
            'cvc',
            'ssn',
            'auth_token',
            'token',
            'secret',
            'api_key',
            'private_key',
        ]);

        $extensionKeys = config('observability.vertical_extensions.additional_sensitive_fields', []);

        $this->sensitiveKeys = array_unique(array_merge($baseKeys, $extensionKeys));
    }

    /**
     * Sanitiza de forma recursiva un arreglo de datos reemplazando llaves sensibles.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function sanitize(array $data): array
    {
        $sanitized = [];

        foreach ($data as $key => $value) {
            $normalizedKey = strtolower((string) $key);

            if ($this->isSensitiveKey($normalizedKey)) {
                $sanitized[$key] = '[REDACTED]';

                continue;
            }

            if (is_array($value)) {
                $sanitized[$key] = $this->sanitize($value);
            } else {
                $sanitized[$key] = $value;
            }
        }

        return $sanitized;
    }

    /**
     * Aplica enmascaramiento seguro a direcciones de correo electrónico.
     */
    public function maskEmail(?string $email): ?string
    {
        if (empty($email) || ! str_contains($email, '@')) {
            return null;
        }

        [$local, $domain] = explode('@', $email, 2);

        if (strlen($local) <= 1) {
            $maskedLocal = '*';
        } else {
            $maskedLocal = substr($local, 0, 1).str_repeat('*', max(1, strlen($local) - 1));
        }

        return $maskedLocal.'@'.$domain;
    }

    /**
     * Verifica si una llave dada coincide con los criterios de desensibilización.
     */
    protected function isSensitiveKey(string $key): bool
    {
        foreach ($this->sensitiveKeys as $sensitive) {
            if ($key === $sensitive || str_ends_with($key, '_'.$sensitive) || str_starts_with($key, $sensitive.'_')) {
                return true;
            }
        }

        return false;
    }
}
