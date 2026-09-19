<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\OwnerResource;
use App\Models\Owner;

class OwnerController extends BaseCrudController
{
    protected string $model = Owner::class;

    protected string $resource = OwnerResource::class;

    protected array $withCount = ['properties'];

    protected array $searchable = ['name', 'document', 'phone', 'email'];

    protected array $filterable = [
        'status' => 'status',
    ];
}
