<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\SpeciesResource;
use App\Models\Species;

class SpeciesController extends BaseCrudController
{
    protected string $model = Species::class;

    protected string $resource = SpeciesResource::class;

    protected array $withCount = ['breeds'];

    protected array $searchable = ['name'];

    protected array $filterable = ['status' => 'status'];
}
