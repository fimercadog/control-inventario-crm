<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AudioRecordingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'care_encounter_id' => $this->care_encounter_id,
            'telegram_file_id' => $this->telegram_file_id,
            'original_filename' => $this->original_filename,
            'file_size_bytes' => $this->file_size_bytes,
            'mime_type' => $this->mime_type,
            'duration_seconds' => $this->duration_seconds,
            'sha256_hash' => $this->sha256_hash,
            'status' => $this->status,
            'error_message' => $this->error_message,
            'chunks' => $this->whenLoaded('chunks'),
            'transcript' => $this->whenLoaded('transcript'),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
