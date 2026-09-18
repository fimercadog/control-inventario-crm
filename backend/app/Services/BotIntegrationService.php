<?php

namespace App\Services;

use App\Models\CareEncounter;
use App\Models\Patient;
use App\Models\PrivacyAcceptance;
use App\Models\TelegramProfessionalLink;
use Illuminate\Http\Request;
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

    public function ingestCareEncounter(array $validated, Request $request, AuditService $audit): array
    {
        $resolution = $this->resolveProfessional((int) $validated['telegram_chat_id']);

        if (! $resolution['success']) {
            return $resolution;
        }

        $companyId = $resolution['company']['id'];
        $professionalId = $resolution['professional']['id'];

        // Validar aislamiento multiempresa del paciente
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
}
