<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CareEncounterResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'patient_id' => $this->patient_id,
            'professional_id' => $this->professional_id,
            'appointment_id' => $this->appointment_id,
            'encounter_code' => $this->encounter_code,
            'started_at' => $this->started_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'encounter_type' => $this->encounter_type,
            'channel' => $this->channel,
            'status' => $this->status,
            'notes_summary' => $this->notes_summary,
            'patient' => new PatientResource($this->whenLoaded('patient')),
            'professional' => new UserResource($this->whenLoaded('professional')),
            'appointment' => new AppointmentResource($this->whenLoaded('appointment')),
            'clinical_note' => new ClinicalNoteResource($this->whenLoaded('clinicalNote')),
            'audio_recordings' => AudioRecordingResource::collection($this->whenLoaded('audioRecordings')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
