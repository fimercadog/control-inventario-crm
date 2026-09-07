<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreClientNoteRequest;
use App\Http\Resources\ClientNoteResource;
use App\Models\ClientNote;
use App\Services\AuditService;
use Illuminate\Http\Request;

class ClientNoteController extends BaseCrudController
{
    protected string $model = ClientNote::class;
    protected string $resource = ClientNoteResource::class;
    protected array $with = ['client', 'author'];
    protected array $searchable = ['body'];
    protected array $filterable = ['client_id' => 'client_id'];

    /** Nota de solo alta (bitacora comercial): el autor es el usuario actual. */
    public function store(Request $request, AuditService $audit)
    {
        $data = app(StoreClientNoteRequest::class)->validated();
        $note = ClientNote::create($data + [
            'company_id' => $this->companyId($request),
            'user_id' => $request->user()?->id,
        ])->load($this->with);
        $audit->record('created', $note, $request);

        return (new ClientNoteResource($note))->response()->setStatusCode(201);
    }
}
