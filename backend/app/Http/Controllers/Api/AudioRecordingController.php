<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\AudioRecordingResource;
use App\Models\AudioRecording;
use App\Models\CareEncounter;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

class AudioRecordingController extends BaseCrudController
{
    protected string $model = AudioRecording::class;

    protected string $resource = AudioRecordingResource::class;

    protected array $with = ['careEncounter', 'chunks', 'transcript'];

    public function store(Request $request, AuditService $audit)
    {
        $request->validate([
            'care_encounter_id' => 'required|exists:care_encounters,id',
            'audio_file' => 'required|file|mimes:mp3,wav,ogg,m4a,aac,flac,webm,opus|max:102400', // max 100MB
            'duration_seconds' => 'nullable|integer',
            'telegram_file_id' => 'nullable|string',
        ]);

        $companyId = $this->companyId($request);
        $encounter = CareEncounter::query()
            ->where('company_id', $companyId)
            ->findOrFail($request->input('care_encounter_id'));

        $file = $request->file('audio_file');
        $hash = hash_file('sha256', $file->getRealPath());
        $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $file->getClientOriginalName());
        $relativePath = 'audios/' . $encounter->id . '/' . $filename;

        // Guarda en el almacenamiento privado seguro
        Storage::disk('local')->putFileAs('audios/' . $encounter->id, $file, $filename);

        $recording = AudioRecording::create([
            'company_id' => $companyId,
            'care_encounter_id' => $encounter->id,
            'telegram_file_id' => $request->input('telegram_file_id'),
            'original_filename' => $file->getClientOriginalName(),
            'file_path' => $relativePath,
            'file_size_bytes' => $file->getSize(),
            'mime_type' => $file->getMimeType() ?: 'audio/ogg',
            'duration_seconds' => $request->input('duration_seconds'),
            'sha256_hash' => $hash,
            'status' => 'almacenado',
        ]);

        $audit->record('created', $recording, $request);

        return (new AudioRecordingResource($recording->load($this->with)))->response()->setStatusCode(201);
    }

    public function signedUrl(Request $request, string $id)
    {
        $recording = AudioRecording::query()
            ->where('company_id', $this->companyId($request))
            ->findOrFail($id);

        $url = URL::temporarySignedRoute(
            'audio.stream',
            now()->addMinutes(15),
            ['id' => $recording->id]
        );

        return response()->json([
            'recording_id' => $recording->id,
            'signed_url' => $url,
            'expires_at' => now()->addMinutes(15)->toIso8601String(),
        ]);
    }

    public function stream(Request $request, string $id)
    {
        if (! $request->hasValidSignature()) {
            abort(403, 'Enlace de reproducción expirado o inválido.');
        }

        $recording = AudioRecording::findOrFail($id);

        if (! Storage::disk('local')->exists($recording->file_path)) {
            abort(404, 'Archivo de audio no encontrado.');
        }

        return Storage::disk('local')->response($recording->file_path, $recording->original_filename, [
            'Content-Type' => $recording->mime_type,
        ]);
    }
}
