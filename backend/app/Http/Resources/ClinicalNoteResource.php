<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClinicalNoteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'care_encounter_id' => $this->care_encounter_id,
            'transcript_id' => $this->transcript_id,
            'template_type' => $this->template_type,
            'note_status' => $this->note_status,
            'title' => $this->title,
            'summary_text' => $this->summary_text,
            'structured_content_json' => $this->structured_content_json,
            'vitals_json' => $this->vitals_json,
            'ai_uncertainties_json' => $this->ai_uncertainties_json,
            'confirmed_by_user_id' => $this->confirmed_by_user_id,
            'confirmed_at' => $this->confirmed_at?->toIso8601String(),
            'confirmed_by' => new UserResource($this->whenLoaded('confirmedBy')),
            'versions' => $this->whenLoaded('versions'),
            'addendums' => $this->whenLoaded('addendums'),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
