<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ActivityResource;
use App\Models\Activity;

class ActivityController extends BaseCrudController
{
    protected string $model = Activity::class;

    protected string $resource = ActivityResource::class;

    protected array $with = ['client', 'deal'];

    protected array $searchable = ['subject'];

    protected array $filterable = ['type' => 'type', 'completed' => 'completed', 'client_id' => 'client_id'];
}
