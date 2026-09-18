<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\CareEncounterResource;
use App\Models\CareEncounter;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CareEncounterController extends BaseCrudController
{
    protected string $model = CareEncounter::class;

    protected string $resource = CareEncounterResource::class;

    protected array $with = ['patient', 'professional', 'appointment', 'clinicalNote', 'audioRecordings'];

    protected array $searchable = ['encounter_code', 'notes_summary'];

    protected array $filterable = [
        'patient_id' => 'patient_id',
        'professional_id' => 'professional_id',
        'status' => 'status',
        'encounter_type' => 'encounter_type',
        'channel' => 'channel',
    ];

    public function store(Request $request, AuditService $audit)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'professional_id' => 'sometimes|exists:users,id',
            'appointment_id' => 'nullable|exists:appointments,id',
            'encounter_type' => 'sometimes|string',
            'channel' => 'sometimes|string',
            'started_at' => 'sometimes|date',
            'notes_summary' => 'nullable|string',
        ]);

        $validated['company_id'] = $this->companyId($request);
        $validated['professional_id'] ??= $request->user()->id;
        $validated['started_at'] ??= now();
        $validated['encounter_code'] = 'ENC-' . date('Ymd') . '-' . strtoupper(Str::random(6));
        $validated['status'] = 'en_proceso';

        $encounter = CareEncounter::create($validated)->load($this->with);
        $audit->record('created', $encounter, $request);

        return (new CareEncounterResource($encounter))->response()->setStatusCode(201);
    }

    public function updateStatus(Request $request, string $id, AuditService $audit)
    {
        $validated = $request->validate([
            'status' => 'required|in:en_proceso,borrador_pendiente,revisada,cerrada',
        ]);

        $encounter = CareEncounter::query()
            ->where('company_id', $this->companyId($request))
            ->findOrFail($id);

        $old = $encounter->getOriginal();
        $encounter->update(['status' => $validated['status']]);

        if ($validated['status'] === 'cerrada' && ! $encounter->completed_at) {
            $encounter->update(['completed_at' => now()]);
        }

        $audit->record('updated', $encounter, $request, $old);

        return new CareEncounterResource($encounter->load($this->with));
    }
}
