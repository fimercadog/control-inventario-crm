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
