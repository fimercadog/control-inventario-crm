<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AuditService;
use App\Services\BotIntegrationService;
use Illuminate\Http\Request;

class BotIntegrationController extends Controller
{
    protected BotIntegrationService $botService;

    public function __construct(BotIntegrationService $botService)
    {
        $this->botService = $botService;
    }

    public function resolveProfessional(Request $request)
    {
        $validated = $request->validate([
            'telegram_chat_id' => 'required|numeric',
        ]);

        $result = $this->botService->resolveProfessional((int) $validated['telegram_chat_id']);

        $statusCode = $result['status'] ?? 200;
        unset($result['status']);

        return response()->json($result, $statusCode);
    }

    public function activeSession(Request $request)
    {
        $validated = $request->validate([
            'telegram_chat_id' => 'required|numeric',
        ]);

        $result = $this->botService->getActiveSession((int) $validated['telegram_chat_id']);

        $statusCode = $result['status'] ?? 200;
        unset($result['status']);

        return response()->json($result, $statusCode);
    }

    public function startSession(Request $request, AuditService $audit)
    {
        $validated = $request->validate([
            'telegram_chat_id' => 'required|numeric',
            'patient_id' => 'required|integer',
            'appointment_id' => 'nullable|integer',
            'encounter_type' => 'nullable|string',
            'started_at' => 'nullable|date',
        ]);

        $result = $this->botService->startSession($validated, $request, $audit);

        $statusCode = $result['status'] ?? 201;
        unset($result['status']);

        return response()->json($result, $statusCode);
    }

    public function addSessionItem(Request $request, AuditService $audit)
    {
        $validated = $request->validate([
            'telegram_chat_id' => 'required|numeric',
            'item_type' => 'required|string|in:audio,text',
            'segment_id' => 'nullable|string',
            'telegram_message_id' => 'nullable|string',
            'text_content' => 'nullable|string',
            'duration_seconds' => 'nullable|integer',
            'file_size_bytes' => 'nullable|integer',
            'audio_file' => 'nullable|file|mimes:mp3,wav,ogg,m4a,aac,flac,webm,opus|max:102400',
            'status' => 'nullable|string',
            'started_at' => 'nullable|date',
        ]);

        $result = $this->botService->addSessionItem($validated, $request, $audit);

        $statusCode = $result['status'] ?? 201;
        unset($result['status']);

        return response()->json($result, $statusCode);
    }

    public function updateItemStatus(Request $request)
    {
        $validated = $request->validate([
            'item_id' => 'required|integer',
            'status' => 'required|string|in:received,downloading,preparing,transcribing,ready,failed',
            'text_content' => 'nullable|string',
            'error_message' => 'nullable|string',
            'provider' => 'nullable|string',
            'language' => 'nullable|string',
        ]);

        $result = $this->botService->updateItemStatus($validated);

        $statusCode = $result['status'] ?? 200;
        unset($result['status']);

        return response()->json($result, $statusCode);
    }

    public function segmentStatus(Request $request)
    {
        $validated = $request->validate([
            'segment_id' => 'required|string',
        ]);

        $result = $this->botService->getSegmentStatus($validated['segment_id']);

        $statusCode = $result['status'] ?? 200;
        unset($result['status']);

        return response()->json($result, $statusCode);
    }

    public function closeSession(Request $request, AuditService $audit)
    {
        $validated = $request->validate([
            'telegram_chat_id' => 'required|numeric',
            'action' => 'required|string|in:confirm,cancel',
        ]);

        $result = $this->botService->closeSession($validated, $request, $audit);

        $statusCode = $result['status'] ?? 200;
        unset($result['status']);

        return response()->json($result, $statusCode);
    }

    public function ingestCareEncounter(Request $request, AuditService $audit)
    {
        $validated = $request->validate([
            'telegram_chat_id' => 'required|numeric',
            'patient_id' => 'required|integer',
            'appointment_id' => 'nullable|integer',
            'encounter_type' => 'nullable|string',
            'status' => 'nullable|string',
            'notes_summary' => 'nullable|string',
            'started_at' => 'nullable|date',
        ]);

        $result = $this->botService->ingestCareEncounter($validated, $request, $audit);

        $statusCode = $result['status'] ?? 201;
        unset($result['status']);

        return response()->json($result, $statusCode);
    }
}
