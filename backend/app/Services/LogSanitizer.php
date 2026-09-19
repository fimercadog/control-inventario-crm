<?php

namespace App\Services;

class LogSanitizer
{
    /**
     * Patrones de claves sensibles que deben redactarse en cualquier nivel de anidamiento.
     */
    private const SENSITIVE_KEY_PATTERNS = [
        '/password/i',
        '/secret/i',
        '/token/i',
        '/authorization/i',
        '/cookie/i',
        '/session/i',
        '/bearer/i',
        '/credit_card/i',
        '/card_number/i',
        '/cvv/i',
        '/ssn/i',
        '/dni/i',
        '/documento/i',
        '/historia_clinica/i',
        '/medical_record/i',
    ];

    /**
     * Sanitiza de manera recursiva un conjunto de datos (array u objeto) ocultando campos sensibles.
     */
    public function sanitize(mixed $data): mixed
    {
        if (is_array($data)) {
            $clean = [];
            foreach ($data as $key => $value) {
                if ($this->isSensitiveKey((string) $key)) {
                    $clean[$key] = '[REDACTED]';
                } else {
                    $clean[$key] = $this->sanitize($value);
                }
            }

            return $clean;
        }

        if (is_object($data)) {
            $clean = new \stdClass;
            foreach (get_object_vars($data) as $key => $value) {
                if ($this->isSensitiveKey((string) $key)) {
                    $clean->{$key} = '[REDACTED]';
                } else {
                    $clean->{$key} = $this->sanitize($value);
                }
            }

            return $clean;
        }

        return $data;
    }

    /**
     * Enmascara un correo electrónico conservando el dominio y la primera letra (ej: m***@esteticaelite.co).
     */
    public function maskEmail(?string $email): string
    {
        if (empty($email) || ! str_contains($email, '@')) {
            return 'u***@unknown';
        }

        [$local, $domain] = explode('@', $email, 2);
        $firstChar = mb_substr($local, 0, 1);

        return $firstChar.'***@'.$domain;
    }

    /**
     * Revisa si una clave coincide con los patrones de información sensible.
     */
    public function isSensitiveKey(string $key): bool
    {
        foreach (self::SENSITIVE_KEY_PATTERNS as $pattern) {
            if (preg_match($pattern, $key) === 1) {
                return true;
            }
        }

        return false;
    }
}
