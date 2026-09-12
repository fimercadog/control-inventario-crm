<?php

namespace App\Support\Plan;

class PlanService
{
    public function tier(): PlanTier
    {
        return PlanTier::current();
    }

    public function has(Feature $feature): bool
    {
        return $this->tier()->rank() >= $feature->minTier()->rank();
    }
}
