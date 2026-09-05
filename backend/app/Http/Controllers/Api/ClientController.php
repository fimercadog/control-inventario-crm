<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ClientResource;
use App\Models\Client;

class ClientController extends BaseCrudController
{
    protected string $model = Client::class;
    protected string $resource = ClientResource::class;
    protected array $searchable = ['name', 'company_name', 'email'];
    protected array $filterable = ['status' => 'status'];
}
