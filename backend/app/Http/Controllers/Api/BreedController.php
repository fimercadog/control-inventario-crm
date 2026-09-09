<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\BreedResource;
use App\Models\Breed;

class BreedController extends BaseCrudController
{
    protected string $model = Breed::class;

    protected string $resource = BreedResource::class;

    protected array $with = ['species'];

    protected array $searchable = ['name'];

    protected array $filterable = ['status' => 'status', 'species_id' => 'species_id'];
}
