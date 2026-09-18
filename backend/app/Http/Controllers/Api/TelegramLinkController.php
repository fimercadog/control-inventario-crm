<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\TelegramLinkResource;
use App\Models\TelegramProfessionalLink;
use App\Services\AuditService;
use Illuminate\Http\Request;

class TelegramLinkController extends BaseCrudController
{
    protected string $model = TelegramProfessionalLink::class;

    protected string $resource = TelegramLinkResource::class;

    public function generatePin(Request $request)
    {
        $user = $request->user();

        $link = TelegramProfessionalLink::firstOrNew(['user_id' => $user->id]);
        $link->verification_pin = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        $link->save();

        return response()->json([
            'user_id' => $user->id,
            'verification_pin' => $link->verification_pin,
            'instructions' => 'Envíe este PIN al bot de Telegram para vincular su cuenta.',
        ]);
    }

    public function verifyPin(Request $request, AuditService $audit)
    {
        $validated = $request->validate([
            'telegram_chat_id' => 'required|numeric',
            'telegram_user_id' => 'nullable|numeric',
            'telegram_username' => 'nullable|string',
            'pin' => 'required|string|size:6',
        ]);

        $link = TelegramProfessionalLink::where('verification_pin', $validated['pin'])->first();

        if (! $link) {
            return response()->json(['message' => 'PIN de verificación inválido o expirado.'], 422);
        }

        $link->update([
            'telegram_chat_id' => $validated['telegram_chat_id'],
            'telegram_user_id' => $validated['telegram_user_id'] ?? null,
            'telegram_username' => $validated['telegram_username'] ?? null,
            'is_verified' => true,
            'verification_pin' => null,
            'linked_at' => now(),
        ]);

        $audit->record('updated', $link, $request);

        return new TelegramLinkResource($link);
    }

    public function status(Request $request)
    {
        $link = TelegramProfessionalLink::where('user_id', $request->user()->id)->first();

        return response()->json([
            'is_linked' => (bool) ($link?->is_verified),
            'telegram_username' => $link?->telegram_username,
            'linked_at' => $link?->linked_at?->toIso8601String(),
        ]);
    }
}
