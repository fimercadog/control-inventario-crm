<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\CategoryResource;
use App\Models\Category;

class CategoryController extends BaseCrudController
{
    protected string $model = Category::class;

    protected string $resource = CategoryResource::class;

    protected array $withCount = ['products'];

    protected array $searchable = ['name'];

    protected array $filterable = ['status' => 'status'];
}
