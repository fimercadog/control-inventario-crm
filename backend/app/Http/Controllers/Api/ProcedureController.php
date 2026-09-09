<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreProcedureImageRequest;
use App\Http\Resources\ProcedureResource;
use App\Models\Procedure;
use App\Rules\ImageFile;
use App\Services\AuditService;
use App\Services\TableQueryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProcedureController extends BaseCrudController
{
    protected string $model = Procedure::class;

    protected string $resource = ProcedureResource::class;

    protected array $with = ['patient', 'service', 'vet'];

    protected array $searchable = ['type'];

    protected array $filterable = ['patient_id' => 'patient_id'];

    public function index(Request $request, TableQueryService $tables)
    {
        $request->merge([
            'date_field' => 'performed_at',
            'sort' => $request->input('sort', 'performed_at'),
            'direction' => $request->input('direction', 'desc'),
        ]);

        return parent::index($request, $tables);
    }

    /** Adjunta el documento de consentimiento (patrón ProductController::image). */
    public function consent(StoreProcedureImageRequest $request, string $id, AuditService $audit)
    {
        $companyId = $this->companyId($request);
        $procedure = Procedure::query()->where('company_id', $companyId)->findOrFail($id);

        $old = $procedure->getOriginal();
        $file = $request->file('document');
        $name = Str::random(40).'.'.ImageFile::extensionFor($file);
        $path = $file->storeAs('procedures/'.$companyId, $name, 'public');

        $procedure->forceFill(['consent_document_url' => Storage::disk('public')->url($path)])->save();
        $audit->record('updated', $procedure, $request, $old);

        return new ProcedureResource($procedure->load($this->with));
    }

    public function restore(Request $request, string $id, AuditService $audit)
    {
        $procedure = Procedure::onlyTrashed()->where('company_id', $this->companyId($request))->findOrFail($id);
        $procedure->restore();
        $audit->record('restored', $procedure, $request);

        return new ProcedureResource($procedure->load($this->with));
    }
}
