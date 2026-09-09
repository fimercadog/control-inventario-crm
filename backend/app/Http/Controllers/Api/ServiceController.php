<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ServiceResource;
use App\Models\Service;

class ServiceController extends BaseCrudController
{
    protected string $model = Service::class;

    protected string $resource = ServiceResource::class;

    protected array $searchable = ['name'];

    protected array $filterable = ['status' => 'status', 'type' => 'type'];
}
