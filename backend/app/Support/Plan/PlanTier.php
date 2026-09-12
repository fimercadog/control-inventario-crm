<?php

namespace App\Support\Plan;

/**
 * Escalon comercial de este despliegue. Mismo concepto que
 * frontend/src/lib/plan.ts (un despliegue = un plan, no hay cambio de plan
 * en caliente por empresa). Ver docs/low-ticket.md.
 */
enum PlanTier: string
{
    case LowTicket = 'low_ticket';
    case Basic = 'basic';
    case Pro = 'pro';
    case Premium = 'premium';

    public static function current(): self
    {
        return self::tryFrom((string) config('plan.tier')) ?? self::LowTicket;
    }

    /** Orden de menor a mayor: un tier cubre los features de los tiers debajo. */
    public function rank(): int
    {
        return match ($this) {
            self::LowTicket => 0,
            self::Basic => 1,
            self::Pro => 2,
            self::Premium => 3,
        };
    }
}
