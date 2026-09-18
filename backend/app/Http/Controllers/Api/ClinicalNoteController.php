<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ClinicalNoteResource;
use App\Models\CareEncounter;
use App\Models\ClinicalNote;
use App\Models\NoteAddendum;
use App\Models\NoteVersion;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClinicalNoteController extends BaseCrudController
{
    protected string $model = ClinicalNote::class;

    protected string $resource = ClinicalNoteResource::class;

    protected array $with = ['careEncounter', 'transcript', 'confirmedBy', 'versions', 'addendums'];

    public function store(Request $request, AuditService $audit)
    {
        $validated = $request->validate([
            'care_encounter_id' => 'required|exists:care_encounters,id',
            'transcript_id' => 'nullable|exists:transcripts,id',
            'template_type' => 'sometimes|string',
            'title' => 'nullable|string',
            'summary_text' => 'nullable|string',
            'structured_content_json' => 'nullable|array',
            'vitals_json' => 'nullable|array',
            'ai_uncertainties_json' => 'nullable|array',
        ]);

        return DB::transaction(function () use ($request, $validated, $audit) {
            $companyId = $this->companyId($request);

            $encounter = CareEncounter::query()
                ->where('company_id', $companyId)
                ->findOrFail($validated['care_encounter_id']);

            $existingNote = ClinicalNote::where('company_id', $companyId)
                ->where('care_encounter_id', $encounter->id)
                ->first();

            if ($existingNote) {
                if ($existingNote->note_status === 'CERRADA') {
                    return response()->json([
                        'message' => 'No se puede modificar una nota clínica CERRADA. Debe agregar una adenda.',
                    ], 422);
                }

                $oldValues = $existingNote->getOriginal();
                $existingNote->update($validated);
                $note = $existingNote->fresh()->load($this->with);

                $versionNumber = $note->versions()->max('version_number') + 1;
                NoteVersion::create([
                    'clinical_note_id' => $note->id,
                    'version_number' => $versionNumber,
                    'snapshot_json' => $note->toArray(),
                    'changed_by_user_id' => $request->user()->id,
                    'change_type' => 'human_edit',
                ]);

                $audit->record('updated', $note, $request, $oldValues);

                return new ClinicalNoteResource($note);
            }

            $validated['company_id'] = $companyId;
            $validated['note_status'] = 'BORRADOR';

            $note = ClinicalNote::create($validated)->load($this->with);

            NoteVersion::create([
                'clinical_note_id' => $note->id,
                'version_number' => 1,
                'snapshot_json' => $note->toArray(),
                'changed_by_user_id' => $request->user()->id,
                'change_type' => 'ai_draft',
            ]);

            $audit->record('created', $note, $request);

            return (new ClinicalNoteResource($note))->response()->setStatusCode(201);
        });
    }

    public function confirm(Request $request, string $id, AuditService $audit)
    {
        $validated = $request->validate([
            'status' => 'required|in:REVISADA,CERRADA',
        ]);

        return DB::transaction(function () use ($request, $id, $validated, $audit) {
            $note = ClinicalNote::query()
                ->where('company_id', $this->companyId($request))
                ->findOrFail($id);

            $old = $note->getOriginal();
            $note->update([
                'note_status' => $validated['status'],
                'confirmed_by_user_id' => $request->user()->id,
                'confirmed_at' => now(),
            ]);

            // Actualiza también el estado de la atención
            if ($validated['status'] === 'CERRADA') {
                $note->careEncounter?->update(['status' => 'cerrada', 'completed_at' => now()]);
            } elseif ($validated['status'] === 'REVISADA') {
                $note->careEncounter?->update(['status' => 'revisada']);
            }

            $versionNumber = $note->versions()->max('version_number') + 1;
            NoteVersion::create([
                'clinical_note_id' => $note->id,
                'version_number' => $versionNumber,
                'snapshot_json' => $note->toArray(),
                'changed_by_user_id' => $request->user()->id,
                'change_type' => 'confirmation',
            ]);

            $audit->record('updated', $note, $request, $old);

            return new ClinicalNoteResource($note->load($this->with));
        });
    }

    public function addendum(Request $request, string $id, AuditService $audit)
    {
        $validated = $request->validate([
            'addendum_text' => 'required|string|min:5',
            'reason' => 'required|string',
        ]);

        $note = ClinicalNote::query()
            ->where('company_id', $this->companyId($request))
            ->findOrFail($id);

        if ($note->note_status !== 'CERRADA') {
            return response()->json([
                'message' => 'Solo se pueden agregar adendas a notas clínicas con estado CERRADA.',
            ], 422);
        }

        $addendum = NoteAddendum::create([
            'clinical_note_id' => $note->id,
            'author_user_id' => $request->user()->id,
            'addendum_text' => $validated['addendum_text'],
            'reason' => $validated['reason'],
        ]);

        $audit->record('created', $addendum, $request);

        return new ClinicalNoteResource($note->fresh()->load($this->with));
    }
}
