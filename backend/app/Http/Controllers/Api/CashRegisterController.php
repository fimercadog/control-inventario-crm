<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\CashRegisterResource;
use App\Models\CashRegister;

class CashRegisterController extends BaseCrudController
{
    protected string $model = CashRegister::class;

    protected string $resource = CashRegisterResource::class;

    protected array $searchable = ['name'];

    protected array $filterable = ['status' => 'status'];
}
