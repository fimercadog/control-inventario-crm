<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\DealResource;
use App\Models\Deal;

class DealController extends BaseCrudController
{
    protected string $model = Deal::class;
    protected string $resource = DealResource::class;
    protected array $with = ['client', 'owner'];
    protected array $searchable = ['title'];
    protected array $filterable = ['stage' => 'stage', 'client_id' => 'client_id'];
}
