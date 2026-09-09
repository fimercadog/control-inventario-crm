<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\DiagnosisResource;
use App\Models\Diagnosis;

class DiagnosisController extends BaseCrudController
{
    protected string $model = Diagnosis::class;

    protected string $resource = DiagnosisResource::class;

    protected array $searchable = ['name', 'code'];

    protected array $filterable = ['status' => 'status'];
}
