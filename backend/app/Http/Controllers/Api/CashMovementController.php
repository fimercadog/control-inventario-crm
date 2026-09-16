<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\CashMovementResource;
use App\Models\CashMovement;

class CashMovementController extends BaseCrudController
{
    protected string $model = CashMovement::class;

    protected string $resource = CashMovementResource::class;

    protected array $with = ['session'];

    protected array $filterable = ['type' => 'type', 'cash_session_id' => 'cash_session_id'];
}
