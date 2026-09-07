<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\SegmentResource;
use App\Models\Segment;

class SegmentController extends BaseCrudController
{
    protected string $model = Segment::class;
    protected string $resource = SegmentResource::class;
    protected array $withCount = ['clients'];
    protected array $searchable = ['name'];
    protected array $filterable = ['status' => 'status'];
}
