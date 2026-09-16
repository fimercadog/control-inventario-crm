<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\AccountReceivableResource;
use App\Models\AccountReceivable;

class AccountReceivableController extends BaseCrudController
{
    protected string $model = AccountReceivable::class;

    protected string $resource = AccountReceivableResource::class;

    protected array $with = ['client', 'invoice'];

    protected array $filterable = ['status' => 'status', 'client_id' => 'client_id'];
}
