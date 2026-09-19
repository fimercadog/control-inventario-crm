<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\VisitResource;
use App\Models\Visit;

class VisitController extends BaseCrudController
{
    protected string $model = Visit::class;

    protected string $resource = VisitResource::class;

    protected array $with = ['property', 'client', 'agent'];

    protected array $searchable = ['notes', 'result'];

    protected array $filterable = [
        'status' => 'status',
        'property_id' => 'property_id',
        'client_id' => 'client_id',
        'agent_id' => 'agent_id',
    ];
}
