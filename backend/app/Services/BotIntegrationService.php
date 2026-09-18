<?php

namespace App\Services;

use App\Models\AudioRecording;
use App\Models\CareEncounter;
use App\Models\CareEncounterItem;
use App\Models\Patient;
use App\Models\PrivacyAcceptance;
use App\Models\TelegramProfessionalLink;
use App\Models\Transcript;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BotIntegrationService
{
    public function resolveProfessional(int $telegramChatId): array
    {
        $link = TelegramProfessionalLink::with('user.company')
            ->where('telegram_chat_id', $telegramChatId)
            ->where('is_verified', true)
            ->first();

        if (! $link) {
            return [
                'success' => false,
                'status' => 422,
                'code' => 'PROFESSIONAL_NOT_LINKED',
                'message' => 'El profesional no tiene una cuenta vinculada en Telegram.',
            ];
        }

        $user = $link->user;

        if (! $user || $user->status !== 'active') {
            return [
                'success' => false,
                'status' => 422,
                'code' => 'PROFESSIONAL_INACTIVE',
                'message' => 'El usuario del profesional se encuentra inactivo.',
            ];
        }

        $company = $user->company;

        if (! $company || (isset($company->status) && $company->status !== 'active')) {
            return [
                'success' => false,
                'status' => 422,
                'code' => 'COMPANY_INACTIVE',
                'message' => 'La empresa asociada al profesional no está activa.',
            ];
        }

        // Verifica aceptación de políticas de privacidad vigentes
        $hasAcceptedPrivacy = PrivacyAcceptance::query()
            ->where('company_id', $company->id)
            ->where(function ($query) use ($user, $telegramChatId) {
                $query->where('user_id', $user->id)
                    ->orWhere('telegram_chat_id', $telegramChatId);
            })
            ->exists();

        if (! $hasAcceptedPrivacy) {
            return [
                'success' => false,
                'status' => 403,
                'code' => 'PRIVACY_POLICY_NOT_ACCEPTED',
                'message' => 'El profesional debe aceptar la política de privacidad vigente en CareNote antes de procesar atenciones.',
            ];
        }

        return [
            'success' => true,
            'status' => 200,
            'professional' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'company' => [
                'id' => $company->id,
                'name' => $company->name,
            ],
            'privacy_accepted' => true,
            'linked_at' => $link->linked_at?->toIso8601String(),
        ];
    }

    public function getActiveSession(int $telegramChatId): array
    {
        $resolution = $this->resolveProfessional($telegramChatId);
        if (! $resolution['success']) {
            return $resolution;
        }

        $companyId = $resolution['company']['id'];
        $professionalId = $resolution['professional']['id'];

        $activeEncounter = CareEncounter::with(['patient', 'items.audioRecording'])
            ->where('company_id', $companyId)
            ->where('professional_id', $professionalId)
            ->where('status', 'en_proceso')
            ->latest()
            ->first();

        if (! $activeEncounter) {
            return [
                'success' => true,
                'has_active_session' => false,
                'encounter' => null,
            ];
        }

        $totalAudioDuration = $activeEncounter->items
            ->where('item_type', 'audio')
            ->sum('duration_seconds');

        return [
            'success' => true,
            'has_active_session' => true,
            'encounter' => [
                'id' => $activeEncounter->id,
                'encounter_code' => $activeEncounter->encounter_code,
                'patient_id' => $activeEncounter->patient_id,
                'patient_name' => $activeEncounter->patient?->name,
                'started_at' => $activeEncounter->started_at->toIso8601String(),
                'items_count' => $activeEncounter->items->count(),
                'audio_count' => $activeEncounter->items->where('item_type', 'audio')->count(),
                'text_count' => $activeEncounter->items->where('item_type', 'text')->count(),
                'total_audio_duration_seconds' => (int) $totalAudioDuration,
            ],
        ];
    }

    public function startSession(array $validated, Request $request, AuditService $audit): array
    {
        $telegramChatId = (int) $validated['telegram_chat_id'];
        $resolution = $this->resolveProfessional($telegramChatId);

        if (! $resolution['success']) {
            return $resolution;
        }

        $companyId = $resolution['company']['id'];
        $professionalId = $resolution['professional']['id'];

        // Verificar si ya existe una sesión activa para este profesional
        $existingSession = CareEncounter::where('company_id', $companyId)
            ->where('professional_id', $professionalId)
            ->where('status', 'en_proceso')
            ->first();

        if ($existingSession) {
            return [
                'success' => false,
                'status' => 409,
                'code' => 'ACTIVE_SESSION_EXISTS',
                'message' => 'El profesional ya tiene una sesión clínica activa en curso.',
                'active_encounter' => [
                    'id' => $existingSession->id,
                    'encounter_code' => $existingSession->encounter_code,
                    'patient_id' => $existingSession->patient_id,
                    'started_at' => $existingSession->started_at->toIso8601String(),
                ],
            ];
        }

        // Validar paciente multiempresa
        $patient = Patient::where('company_id', $companyId)->find($validated['patient_id']);
        if (! $patient) {
            return [
                'success' => false,
                'status' => 422,
                'code' => 'PATIENT_NOT_FOUND',
                'message' => 'El paciente no existe o no pertenece a la empresa del profesional.',
            ];
        }

        $code = 'ENC-BOT-' . strtoupper(Str::random(6));

        $encounter = CareEncounter::create([
            'company_id' => $companyId,
            'patient_id' => $patient->id,
            'professional_id' => $professionalId,
            'appointment_id' => $validated['appointment_id'] ?? null,
            'encounter_code' => $code,
            'started_at' => $validated['started_at'] ?? now(),
            'encounter_type' => $validated['encounter_type'] ?? 'atencion_domiciliaria',
            'channel' => 'telegram',
            'status' => 'en_proceso',
        ]);

        $audit->record('session_started_via_bot', $encounter, $request);

        return [
            'success' => true,
            'status' => 201,
            'encounter' => $encounter->load(['patient', 'professional', 'company']),
            'professional' => $resolution['professional'],
            'company' => $resolution['company'],
        ];
    }

    public function startAudioSegment(array $validated, Request $request, AuditService $audit): array
    {
        $telegramChatId = (int) $validated['telegram_chat_id'];
        $resolution = $this->resolveProfessional($telegramChatId);

        if (! $resolution['success']) {
            return $resolution;
        }

        $companyId = $resolution['company']['id'];
        $professionalId = $resolution['professional']['id'];

        $encounter = CareEncounter::where('company_id', $companyId)
            ->where('professional_id', $professionalId)
            ->where('status', 'en_proceso')
            ->first();

        if (! $encounter) {
            return [
                'success' => false,
                'status' => 422,
                'code' => 'NO_ACTIVE_SESSION',
                'message' => 'No hay ninguna sesión clínica activa para iniciar la grabación.',
            ];
        }

        // Verificar si ya existe un segmento activo pendiente de audio
        $pendingSegment = CareEncounterItem::where('care_encounter_id', $encounter->id)
            ->where('item_type', 'audio')
            ->whereNull('received_at')
            ->where('status', 'preparing')
            ->first();

        if ($pendingSegment) {
            return [
                'success' => false,
                'status' => 409,
                'code' => 'ACTIVE_SEGMENT_EXISTS',
                'message' => 'Ya tienes una grabación de audio en curso para esta sesión.',
                'pending_segment' => [
                    'segment_id' => $pendingSegment->segment_id,
                    'sequence_number' => $pendingSegment->sequence_number,
                    'started_at' => $pendingSegment->started_at?->toIso8601String(),
                ],
            ];
        }

        $nextSeq = (int) CareEncounterItem::where('care_encounter_id', $encounter->id)->max('sequence_number') + 1;
        $segmentId = 'seg_' . strtolower(Str::random(12));

        $item = CareEncounterItem::create([
            'company_id' => $companyId,
            'care_encounter_id' => $encounter->id,
            'sequence_number' => $nextSeq,
            'item_type' => 'audio',
            'segment_id' => $segmentId,
            'status' => 'preparing',
            'started_at' => now(),
            'received_at' => null,
        ]);

        $audit->record('audio_segment_started', $item, $request);

        return [
            'success' => true,
            'status' => 201,
            'segment_id' => $segmentId,
            'sequence_number' => $nextSeq,
            'encounter_id' => $encounter->id,
            'started_at' => $item->started_at->toIso8601String(),
        ];
    }

    public function addSessionItem(array $validated, Request $request, AuditService $audit): array
    {
        $telegramChatId = (int) $validated['telegram_chat_id'];
        $resolution = $this->resolveProfessional($telegramChatId);

        if (! $resolution['success']) {
            return $resolution;
        }

        $companyId = $resolution['company']['id'];
        $professionalId = $resolution['professional']['id'];

        $encounter = CareEncounter::where('company_id', $companyId)
            ->where('professional_id', $professionalId)
            ->where('status', 'en_proceso')
            ->first();

        if (! $encounter) {
            return [
                'success' => false,
                'status' => 422,
                'code' => 'NO_ACTIVE_SESSION',
                'message' => 'No hay ninguna sesión clínica activa para registrar este elemento.',
            ];
        }

        $itemType = $validated['item_type'] ?? 'audio';

        if ($itemType === 'audio') {
            // Buscar si existe un segmento pendiente previamente iniciado mediante "▶️ Iniciar audio"
            $pendingSegment = null;
            if (! empty($validated['segment_id'])) {
                $pendingSegment = CareEncounterItem::where('care_encounter_id', $encounter->id)
                    ->where('segment_id', $validated['segment_id'])
                    ->whereNull('received_at')
                    ->first();
            }

            if (! $pendingSegment) {
                $pendingSegment = CareEncounterItem::where('care_encounter_id', $encounter->id)
                    ->where('item_type', 'audio')
                    ->whereNull('received_at')
                    ->first();
            }

            if ($pendingSegment) {
                // Usar el segmento existente e incorporar el audio entregado
                $item = $pendingSegment;
                $audioRecordingId = null;

                if ($request->hasFile('audio_file')) {
                    $file = $request->file('audio_file');
                    $hash = hash_file('sha256', $file->getRealPath());
                    $filename = time() . '_seq' . $item->sequence_number . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $file->getClientOriginalName());
                    $relativePath = 'audios/' . $encounter->id . '/' . $filename;

                    Storage::disk('local')->putFileAs('audios/' . $encounter->id, $file, $filename);

                    $recording = AudioRecording::create([
                        'company_id' => $companyId,
                        'care_encounter_id' => $encounter->id,
                        'telegram_file_id' => $validated['telegram_message_id'] ?? null,
                        'original_filename' => $file->getClientOriginalName(),
                        'file_path' => $relativePath,
                        'file_size_bytes' => $file->getSize(),
                        'mime_type' => $file->getMimeType() ?: 'audio/ogg',
                        'duration_seconds' => $validated['duration_seconds'] ?? null,
                        'sha256_hash' => $hash,
                        'status' => 'recibido',
                    ]);

                    $audioRecordingId = $recording->id;
                }

                $item->update([
                    'telegram_message_id' => $validated['telegram_message_id'] ?? $item->telegram_message_id,
                    'audio_recording_id' => $audioRecordingId,
                    'duration_seconds' => $validated['duration_seconds'] ?? $item->duration_seconds,
                    'file_size_bytes' => $validated['file_size_bytes'] ?? $item->file_size_bytes,
                    'status' => $validated['status'] ?? 'received',
                    'received_at' => now(),
                ]);

                $audit->record('session_item_delivered', $item, $request);

                return [
                    'success' => true,
                    'status' => 200,
                    'item' => $item->fresh('audioRecording'),
                    'encounter_id' => $encounter->id,
                    'sequence_number' => $item->sequence_number,
                    'auto_created' => false,
                ];
            }

            // Si NO había un segmento pendiente (Enfermera envió audio directo sin pulsar "▶️ Iniciar audio")
            // Se crea un segmento automático sin rechazar la información clínica
            $nextSeq = (int) CareEncounterItem::where('care_encounter_id', $encounter->id)->max('sequence_number') + 1;
            $autoSegmentId = ! empty($validated['segment_id']) ? $validated['segment_id'] : ('seg_auto_' . strtolower(Str::random(10)));

            $audioRecordingId = null;
            if ($request->hasFile('audio_file')) {
                $file = $request->file('audio_file');
                $hash = hash_file('sha256', $file->getRealPath());
                $filename = time() . '_seq' . $nextSeq . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $file->getClientOriginalName());
                $relativePath = 'audios/' . $encounter->id . '/' . $filename;

                Storage::disk('local')->putFileAs('audios/' . $encounter->id, $file, $filename);

                $recording = AudioRecording::create([
                    'company_id' => $companyId,
                    'care_encounter_id' => $encounter->id,
                    'telegram_file_id' => $validated['telegram_message_id'] ?? null,
                    'original_filename' => $file->getClientOriginalName(),
                    'file_path' => $relativePath,
                    'file_size_bytes' => $file->getSize(),
                    'mime_type' => $file->getMimeType() ?: 'audio/ogg',
                    'duration_seconds' => $validated['duration_seconds'] ?? null,
                    'sha256_hash' => $hash,
                    'status' => 'recibido',
                ]);

                $audioRecordingId = $recording->id;
            }

            $item = CareEncounterItem::create([
                'company_id' => $companyId,
                'care_encounter_id' => $encounter->id,
                'sequence_number' => $nextSeq,
                'item_type' => 'audio',
                'segment_id' => $autoSegmentId,
                'telegram_message_id' => $validated['telegram_message_id'] ?? null,
                'audio_recording_id' => $audioRecordingId,
                'duration_seconds' => $validated['duration_seconds'] ?? null,
                'file_size_bytes' => $validated['file_size_bytes'] ?? null,
                'status' => $validated['status'] ?? 'received',
                'auto_created' => true,
                'started_at' => now(),
                'received_at' => now(),
            ]);

            $audit->record('session_item_auto_created', $item, $request);

            return [
                'success' => true,
                'status' => 201,
                'item' => $item->load('audioRecording'),
                'encounter_id' => $encounter->id,
                'sequence_number' => $nextSeq,
                'auto_created' => true,
            ];
        }

        // Si es texto
        $nextSeq = (int) CareEncounterItem::where('care_encounter_id', $encounter->id)->max('sequence_number') + 1;

        $item = CareEncounterItem::create([
            'company_id' => $companyId,
            'care_encounter_id' => $encounter->id,
            'sequence_number' => $nextSeq,
            'item_type' => 'text',
            'telegram_message_id' => $validated['telegram_message_id'] ?? null,
            'text_content' => $validated['text_content'] ?? null,
            'status' => 'ready',
            'started_at' => now(),
            'received_at' => now(),
            'processed_at' => now(),
        ]);

        $audit->record('session_text_item_added', $item, $request);

        return [
            'success' => true,
            'status' => 201,
            'item' => $item,
            'encounter_id' => $encounter->id,
            'sequence_number' => $nextSeq,
        ];
    }

    public function updateItemStatus(array $validated): array
    {
        $item = CareEncounterItem::with('audioRecording')->find($validated['item_id']);

        if (! $item) {
            return [
                'success' => false,
                'status' => 404,
                'code' => 'ITEM_NOT_FOUND',
                'message' => 'El elemento de sesión especificado no existe.',
            ];
        }

        $status = $validated['status'];
        $item->status = $status;

        if (isset($validated['text_content'])) {
            $item->text_content = $validated['text_content'];
        }

        if (isset($validated['error_message'])) {
            $item->error_message = $validated['error_message'];
        }

        if ($status === 'ready' || $status === 'failed') {
            $item->processed_at = now();
        }

        $item->save();

        if ($item->audioRecording) {
            $recStatus = match ($status) {
                'transcribing' => 'transcribiendo',
                'ready' => 'completado',
                'failed' => 'error',
                default => 'almacenado',
            };

            $item->audioRecording->update([
                'status' => $recStatus,
                'error_message' => $validated['error_message'] ?? null,
            ]);

            if ($status === 'ready' && isset($validated['text_content'])) {
                Transcript::updateOrCreate(
                    ['audio_recording_id' => $item->audioRecording->id],
                    [
                        'raw_text' => $validated['text_content'],
                        'transcription_provider' => $validated['provider'] ?? 'whisper_api',
                        'language' => $validated['language'] ?? 'es',
                        'processed_at' => now(),
                    ]
                );
            }
        }

        return [
            'success' => true,
            'status' => 200,
            'item' => $item,
        ];
    }

    public function closeSession(array $validated, Request $request, AuditService $audit): array
    {
        $telegramChatId = (int) $validated['telegram_chat_id'];
        $action = $validated['action'] ?? 'confirm'; // confirm | cancel

        $resolution = $this->resolveProfessional($telegramChatId);
        if (! $resolution['success']) {
            return $resolution;
        }

        $companyId = $resolution['company']['id'];
        $professionalId = $resolution['professional']['id'];

        $encounter = CareEncounter::with(['patient', 'items' => function ($q) {
            $q->orderBy('sequence_number', 'asc');
        }])
            ->where('company_id', $companyId)
            ->where('professional_id', $professionalId)
            ->where('status', 'en_proceso')
            ->first();

        if (! $encounter) {
            return [
                'success' => false,
                'status' => 422,
                'code' => 'NO_ACTIVE_SESSION',
                'message' => 'No hay ninguna sesión clínica activa para finalizar o cancelar.',
            ];
        }

        if ($action === 'cancel') {
            $encounter->update(['status' => 'cancelada']);
            $audit->record('session_cancelled_via_bot', $encounter, $request);

            return [
                'success' => true,
                'status' => 200,
                'action' => 'cancelled',
                'encounter_id' => $encounter->id,
                'message' => 'La sesión clínica fue cancelada correctamente.',
            ];
        }

        // Verificar que todos los elementos estén procesados
        $pendingItems = $encounter->items->whereNotIn('status', ['ready']);
        if ($pendingItems->count() > 0) {
            return [
                'success' => false,
                'status' => 422,
                'code' => 'ITEMS_NOT_READY',
                'message' => 'Aún hay elementos en proceso de transcripción o con errores.',
                'pending_items_count' => $pendingItems->count(),
            ];
        }

        // Consolidación ordenada de elementos de la sesión
        $consolidatedParts = [];
        foreach ($encounter->items as $item) {
            $header = "--- [Secuencia #{$item->sequence_number} - " . strtoupper($item->item_type);
            if ($item->item_type === 'audio' && $item->duration_seconds) {
                $mins = floor($item->duration_seconds / 60);
                $secs = $item->duration_seconds % 60;
                $header .= " ({$mins}m {$secs}s)";
            }
            $header .= "] ---";

            $content = trim($item->text_content ?? '[Sin contenido]');
            $consolidatedParts[] = $header . "\n" . $content;
        }

        $consolidatedText = implode("\n\n", $consolidatedParts);

        $encounter->update([
            'status' => 'borrador_pendiente',
            'notes_summary' => $consolidatedText,
            'completed_at' => now(),
        ]);

        $audit->record('session_closed_and_consolidated_via_bot', $encounter, $request);

        $totalAudioSeconds = (int) $encounter->items->where('item_type', 'audio')->sum('duration_seconds');
        $minsTotal = floor($totalAudioSeconds / 60);
        $secsTotal = $totalAudioSeconds % 60;

        return [
            'success' => true,
            'status' => 200,
            'action' => 'closed',
            'summary' => [
                'encounter_id' => $encounter->id,
                'encounter_code' => $encounter->encounter_code,
                'patient_name' => $encounter->patient?->name,
                'total_items' => $encounter->items->count(),
                'total_audios' => $encounter->items->where('item_type', 'audio')->count(),
                'total_texts' => $encounter->items->where('item_type', 'text')->count(),
                'total_audio_duration' => "{$minsTotal}m {$secsTotal}s",
                'consolidated_text' => $consolidatedText,
            ],
        ];
    }

    public function ingestCareEncounter(array $validated, Request $request, AuditService $audit): array
    {
        $resolution = $this->resolveProfessional((int) $validated['telegram_chat_id']);

        if (! $resolution['success']) {
            return $resolution;
        }

        $companyId = $resolution['company']['id'];
        $professionalId = $resolution['professional']['id'];

        $patient = Patient::query()
            ->where('company_id', $companyId)
            ->find($validated['patient_id']);

        if (! $patient) {
            return [
                'success' => false,
                'status' => 422,
                'code' => 'PATIENT_NOT_FOUND',
                'message' => 'El paciente no existe o no pertenece a la empresa del profesional.',
            ];
        }

        $code = 'ENC-BOT-' . strtoupper(Str::random(6));

        $encounter = CareEncounter::create([
            'company_id' => $companyId,
            'patient_id' => $patient->id,
            'professional_id' => $professionalId,
            'appointment_id' => $validated['appointment_id'] ?? null,
            'encounter_code' => $code,
            'started_at' => $validated['started_at'] ?? now(),
            'encounter_type' => $validated['encounter_type'] ?? 'atencion_domiciliaria',
            'channel' => 'telegram',
            'status' => $validated['status'] ?? 'en_proceso',
            'notes_summary' => $validated['notes_summary'] ?? null,
        ]);

        $audit->record('ingested_via_bot', $encounter, $request);

        return [
            'success' => true,
            'status' => 201,
            'encounter' => $encounter->load(['patient', 'professional', 'company']),
            'professional' => $resolution['professional'],
            'company' => $resolution['company'],
        ];
    }

    public function getSegmentStatus(string $segmentId): array
    {
        $item = CareEncounterItem::where('segment_id', $segmentId)->first();

        if (! $item) {
            return [
                'success' => true,
                'status' => 200,
                'segment_id' => $segmentId,
                'is_delivered' => false,
                'state' => 'pending',
            ];
        }

        $isDelivered = $item->received_at !== null || in_array($item->status, ['received', 'downloading', 'transcribing', 'ready', 'failed']);

        return [
            'success' => true,
            'status' => 200,
            'segment_id' => $segmentId,
            'is_delivered' => $isDelivered,
            'state' => $item->status,
            'item_id' => $item->id,
            'received_at' => $item->received_at?->toIso8601String(),
        ];
    }
}
