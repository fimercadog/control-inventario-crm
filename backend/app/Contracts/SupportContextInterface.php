<?php

namespace App\Contracts;

interface SupportContextInterface
{
    /**
     * Retorna el contrato común desensibilizado para soporte técnico y observabilidad.
     *
     * @return array{
     *     request_id: string,
     *     user_id: int|string|null,
     *     company_id: int|string|null,
     *     module: string,
     *     url: string,
     *     timestamp: string,
     *     environment: string,
     *     app_version: string,
     *     feedback_message: string|null,
     *     meta: array<string, mixed>
     * }
     */
    public function toArray(): array;
}
