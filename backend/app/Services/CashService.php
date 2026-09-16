<?php

namespace App\Services;

use App\Models\CashSession;
use Illuminate\Support\Facades\DB;

class CashService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function open(array $data, int $companyId, int $userId): CashSession
    {
        return DB::transaction(function () use ($data, $companyId, $userId) {
            if (! empty($data['idempotency_key'])) {
                $existing = CashSession::where('company_id', $companyId)->where('idempotency_key', $data['idempotency_key'])->first();
                if ($existing) {
                    return $existing->load('register', 'movements');
                }
            }

            abort_if(
                CashSession::where('company_id', $companyId)->where('cash_register_id', $data['cash_register_id'])->where('status', 'open')->exists(),
                422,
                'La caja ya tiene una sesion abierta.',
            );

            $opening = round((float) ($data['opening_amount'] ?? 0), 2);

            return CashSession::create([
                'company_id' => $companyId,
                'cash_register_id' => $data['cash_register_id'],
                'opened_by' => $userId,
                'opened_at' => now(),
                'opening_amount' => $opening,
                'expected_amount' => $opening,
                'status' => 'open',
                'notes' => $data['notes'] ?? null,
                'idempotency_key' => $data['idempotency_key'] ?? null,
            ])->load('register', 'movements');
        });
    }

    public function close(CashSession $session, float $closingAmount, int $userId, ?string $notes = null): CashSession
    {
        return DB::transaction(function () use ($session, $closingAmount, $userId, $notes) {
            $session = CashSession::whereKey($session->id)->lockForUpdate()->firstOrFail();
            abort_if($session->status !== 'open', 422, 'La sesion de caja ya fue cerrada.');

            $expected = round((float) $session->opening_amount + (float) $session->movements()->sum('amount'), 2);
            $closing = round($closingAmount, 2);
            $session->update([
                'closed_by' => $userId,
                'closed_at' => now(),
                'expected_amount' => $expected,
                'closing_amount' => $closing,
                'difference' => round($closing - $expected, 2),
                'status' => 'closed',
                'notes' => $notes ?? $session->notes,
            ]);

            return $session->load('register', 'movements');
        });
    }
}
