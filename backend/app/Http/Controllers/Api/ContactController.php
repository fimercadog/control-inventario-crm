<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ContactResource;
use App\Models\Contact;

class ContactController extends BaseCrudController
{
    protected string $model = Contact::class;
    protected string $resource = ContactResource::class;
    protected array $with = ['client'];
    protected array $searchable = ['name', 'email', 'phone', 'role'];
    protected array $filterable = ['status' => 'status', 'client_id' => 'client_id'];
}
