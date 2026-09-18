<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\PrivacyAcceptanceResource;
use App\Models\PrivacyAcceptance;
use App\Services\AuditService;
use Illuminate\Http\Request;

class PrivacyAcceptanceController extends BaseCrudController
{
    protected string $model = PrivacyAcceptance::class;

    protected string $resource = PrivacyAcceptanceResource::class;

    protected array $with = ['user'];

    public function store(Request $request, AuditService $audit)
    {
        $validated = $request->validate([
            'policy_version' => 'required|string',
            'telegram_chat_id' => 'nullable|numeric',
        ]);

        $acceptance = PrivacyAcceptance::create([
            'company_id' => $this->companyId($request),
            'user_id' => $request->user()?->id,
            'telegram_chat_id' => $validated['telegram_chat_id'] ?? null,
            'policy_version' => $validated['policy_version'],
            'accepted_at' => now(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $audit->record('created', $acceptance, $request);

        return (new PrivacyAcceptanceResource($acceptance->load('user')))->response()->setStatusCode(201);
    }
}
