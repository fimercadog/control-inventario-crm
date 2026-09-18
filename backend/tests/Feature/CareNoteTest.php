<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\CareEncounter;
use App\Models\Client;
use App\Models\ClinicalNote;
use App\Models\Company;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CareNoteTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    private User $nurse;

    private Patient $patient;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::create([
            'name' => 'CareNote Health IPS',
            'legal_name' => 'CareNote Health IPS S.A.S.',
            'tax_id' => '900123456-1',
            'status' => 'active',
        ]);

        $this->nurse = User::create([
            'company_id' => $this->company->id,
            'name' => 'Laura Perez RN',
            'email' => 'laura@carenote.health',
            'password' => bcrypt('password123'),
            'status' => 'active',
        ]);

        $role = Role::firstOrCreate(['name' => 'Enfermera/o', 'guard_name' => 'web']);
        $permissions = [
            'care_encounters.manage', 'care_encounters.view',
            'clinical_notes.manage', 'clinical_notes.view',
            'audio_recordings.manage', 'privacy_acceptances.view',
            'patients.manage', 'appointments.manage',
        ];

        foreach ($permissions as $p) {
            Permission::firstOrCreate(['name' => $p, 'guard_name' => 'web']);
        }

        $role->syncPermissions($permissions);
        $this->nurse->assignRole($role);

        $client = Client::create([
            'company_id' => $this->company->id,
            'name' => 'EPS Sanitas',
            'email' => 'contacto@eps-sanitas.com',
            'status' => 'active',
        ]);

        $this->patient = Patient::create([
            'company_id' => $this->company->id,
            'client_id' => $client->id,
            'name' => 'Maria Gonzalez',
            'first_name' => 'Maria',
            'last_name' => 'Gonzalez',
            'document_type' => 'CC',
            'document_number' => '10203040',
            'sex' => 'female',
            'phone' => '3001234567',
            'address' => 'Calle 100 # 15-20',
            'city' => 'Bogota',
            'health_coverage_provider' => 'EPS Sanitas',
            'status' => 'active',
        ]);
    }

    public function test_nurse_can_create_care_encounter(): void
    {
        $response = $this->actingAs($this->nurse, 'sanctum')
            ->postJson('/api/care-encounters', [
                'patient_id' => $this->patient->id,
                'encounter_type' => 'atencion_domiciliaria',
                'notes_summary' => 'Curacion de herida y control de signos vitales',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'en_proceso')
            ->assertJsonPath('data.patient_id', $this->patient->id);

        $this->assertDatabaseHas('care_encounters', [
            'patient_id' => $this->patient->id,
            'professional_id' => $this->nurse->id,
            'encounter_type' => 'atencion_domiciliaria',
            'status' => 'en_proceso',
        ]);
    }

    public function test_care_encounter_can_link_optional_appointment(): void
    {
        $appointment = Appointment::create([
            'company_id' => $this->company->id,
            'patient_id' => $this->patient->id,
            'starts_at' => now(),
            'ends_at' => now()->addHour(),
            'duration_minutes' => 60,
            'status' => 'scheduled',
        ]);

        $response = $this->actingAs($this->nurse, 'sanctum')
            ->postJson('/api/care-encounters', [
                'patient_id' => $this->patient->id,
                'appointment_id' => $appointment->id,
                'encounter_type' => 'atencion_domiciliaria',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.appointment_id', $appointment->id);
    }

    public function test_clinical_note_draft_and_versioning_lifecycle(): void
    {
        $encounter = CareEncounter::create([
            'company_id' => $this->company->id,
            'patient_id' => $this->patient->id,
            'professional_id' => $this->nurse->id,
            'encounter_code' => 'ENC-20260917-TEST01',
            'started_at' => now(),
            'status' => 'en_proceso',
        ]);

        // 1. Crear borrador inicial
        $storeResponse = $this->actingAs($this->nurse, 'sanctum')
            ->postJson('/api/clinical-notes', [
                'care_encounter_id' => $encounter->id,
                'template_type' => 'soap',
                'title' => 'Evolución de Enfermería Domiciliaria',
                'summary_text' => 'Paciente estable, herida limpia',
                'structured_content_json' => [
                    'subjective' => 'Refiere dolor leve 2/10',
                    'objective' => 'TA 110/70, FC 68, SpO2 98%',
                    'assessment' => 'Herida con adecuada cicatrizacion',
                    'plan' => 'Continuar curaciones cada 48h',
                ],
            ]);

        $storeResponse->assertStatus(201)
            ->assertJsonPath('data.note_status', 'BORRADOR')
            ->assertJsonPath('data.template_type', 'soap');

        $noteId = $storeResponse->json('data.id');

        // 2. Editar borrador (genera version 2)
        $updateResponse = $this->actingAs($this->nurse, 'sanctum')
            ->postJson('/api/clinical-notes', [
                'care_encounter_id' => $encounter->id,
                'summary_text' => 'Paciente estable, herida limpia. Se retiran puntos.',
            ]);

        $updateResponse->assertStatus(200);

        $this->assertDatabaseHas('note_versions', [
            'clinical_note_id' => $noteId,
            'version_number' => 2,
        ]);

        // 3. Confirmar y cerrar la nota
        $confirmResponse = $this->actingAs($this->nurse, 'sanctum')
            ->postJson("/api/clinical-notes/{$noteId}/confirm", [
                'status' => 'CERRADA',
            ]);

        $confirmResponse->assertStatus(200)
            ->assertJsonPath('data.note_status', 'CERRADA')
            ->assertJsonPath('data.confirmed_by_user_id', $this->nurse->id);

        // 4. Intentar editar una nota CERRADA (debe ser rechazado con 422)
        $invalidEdit = $this->actingAs($this->nurse, 'sanctum')
            ->postJson('/api/clinical-notes', [
                'care_encounter_id' => $encounter->id,
                'summary_text' => 'Intento de edicion ilegal',
            ]);

        $invalidEdit->assertStatus(422);

        // 5. Agregar adenda a nota CERRADA (debe ser permitido)
        $addendumResponse = $this->actingAs($this->nurse, 'sanctum')
            ->postJson("/api/clinical-notes/{$noteId}/addendum", [
                'addendum_text' => 'Se reporta novedad al medico tratante via telefónica.',
                'reason' => 'Notificación a medico supervisor',
            ]);

        $addendumResponse->assertStatus(200);

        $this->assertDatabaseHas('note_addendums', [
            'clinical_note_id' => $noteId,
            'author_user_id' => $this->nurse->id,
            'reason' => 'Notificación a medico supervisor',
        ]);
    }

    public function test_audio_recording_upload_and_signed_url_streaming(): void
    {
        Storage::fake('local');

        $encounter = CareEncounter::create([
            'company_id' => $this->company->id,
            'patient_id' => $this->patient->id,
            'professional_id' => $this->nurse->id,
            'encounter_code' => 'ENC-20260917-AUDIO01',
            'started_at' => now(),
            'status' => 'en_proceso',
        ]);

        $audioFile = UploadedFile::fake()->create('evolucion_nota.ogg', 500, 'audio/ogg');

        $uploadResponse = $this->actingAs($this->nurse, 'sanctum')
            ->postJson('/api/audio-recordings', [
                'care_encounter_id' => $encounter->id,
                'audio_file' => $audioFile,
                'duration_seconds' => 120,
            ]);

        $uploadResponse->assertStatus(201)
            ->assertJsonPath('data.original_filename', 'evolucion_nota.ogg')
            ->assertJsonPath('data.status', 'almacenado');

        $recordingId = $uploadResponse->json('data.id');

        // Obtener URL firmada
        $signedResponse = $this->actingAs($this->nurse, 'sanctum')
            ->getJson("/api/audio-recordings/{$recordingId}/signed-url");

        $signedResponse->assertStatus(200)
            ->assertJsonStructure(['recording_id', 'signed_url', 'expires_at']);

        $signedUrl = $signedResponse->json('signed_url');

        // Streaming con firma válida
        $streamResponse = $this->get($signedUrl);
        $streamResponse->assertStatus(200);

        // Streaming con firma inválida debe fallar con 403
        $badUrl = URL::to("/api/audio-recordings/{$recordingId}/stream?signature=invalid");
        $this->get($badUrl)->assertStatus(403);
    }

    public function test_telegram_pin_generation_and_verification(): void
    {
        // 1. Generar PIN
        $pinResponse = $this->actingAs($this->nurse, 'sanctum')
            ->getJson('/api/telegram-link/pin');

        $pinResponse->assertStatus(200)
            ->assertJsonStructure(['user_id', 'verification_pin', 'instructions']);

        $pin = $pinResponse->json('verification_pin');

        // 2. Verificar PIN desde webhook de Telegram
        $verifyResponse = $this->actingAs($this->nurse, 'sanctum')
            ->postJson('/api/telegram-link/verify', [
                'telegram_chat_id' => 987654321,
                'telegram_username' => 'enfermera_laura',
                'pin' => $pin,
            ]);

        $verifyResponse->assertStatus(200)
            ->assertJsonPath('data.is_verified', true)
            ->assertJsonPath('data.telegram_chat_id', 987654321);

        // 3. Consultar estado
        $statusResponse = $this->actingAs($this->nurse, 'sanctum')
            ->getJson('/api/telegram-link/status');

        $statusResponse->assertStatus(200)
            ->assertJsonPath('is_linked', true)
            ->assertJsonPath('telegram_username', 'enfermera_laura');
    }

    public function test_privacy_acceptance_recording_and_listing(): void
    {
        $response = $this->actingAs($this->nurse, 'sanctum')
            ->postJson('/api/privacy-acceptances', [
                'policy_version' => 'v1.0-carenote-2026',
                'telegram_chat_id' => 987654321,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.policy_version', 'v1.0-carenote-2026');

        $this->assertDatabaseHas('privacy_acceptances', [
            'company_id' => $this->company->id,
            'user_id' => $this->nurse->id,
            'policy_version' => 'v1.0-carenote-2026',
        ]);

        $indexResponse = $this->actingAs($this->nurse, 'sanctum')
            ->getJson('/api/privacy-acceptances');

        $indexResponse->assertStatus(200)
            ->assertJsonPath('data.0.policy_version', 'v1.0-carenote-2026');
    }

    public function test_bot_secret_token_authentication_validation(): void
    {
        // Sin token de secreto del bot
        $noTokenResponse = $this->postJson('/api/v1/bot/resolve-professional', [
            'telegram_chat_id' => 987654321,
        ]);
        $noTokenResponse->assertStatus(401)
            ->assertJsonPath('error', 'UNAUTHORIZED_BOT_TOKEN');

        // Con token inválido
        $invalidTokenResponse = $this->withHeader('X-CareNote-Bot-Secret', 'secret-invalido')
            ->postJson('/api/v1/bot/resolve-professional', [
                'telegram_chat_id' => 987654321,
            ]);
        $invalidTokenResponse->assertStatus(401)
            ->assertJsonPath('error', 'UNAUTHORIZED_BOT_TOKEN');

        // Con token válido
        $validSecret = config('services.carenote_bot.secret', 'carenote-bot-secret-dev-2026');
        $validResponse = $this->withHeader('X-CareNote-Bot-Secret', $validSecret)
            ->postJson('/api/v1/bot/resolve-professional', [
                'telegram_chat_id' => 987654321,
            ]);
        // Aunque no esté vinculado, supera la barrera de autenticación del middleware de servicio
        $this->assertNotEquals(401, $validResponse->status());
    }

    public function test_bot_resolution_flow_unlinked_inactive_and_privacy_checks(): void
    {
        $botSecret = config('services.carenote_bot.secret', 'carenote-bot-secret-dev-2026');
        $chatId = 888777666;

        // 1. Chat ID no vinculado
        $unlinkedResponse = $this->withHeader('X-CareNote-Bot-Secret', $botSecret)
            ->postJson('/api/v1/bot/resolve-professional', [
                'telegram_chat_id' => $chatId,
            ]);
        $unlinkedResponse->assertStatus(422)
            ->assertJsonPath('code', 'PROFESSIONAL_NOT_LINKED');

        // Vincular usuario
        $link = \App\Models\TelegramProfessionalLink::create([
            'user_id' => $this->nurse->id,
            'telegram_chat_id' => $chatId,
            'is_verified' => true,
            'linked_at' => now(),
        ]);

        // 2. Vinculado pero sin aceptar política de privacidad
        $privacyCheckResponse = $this->withHeader('X-CareNote-Bot-Secret', $botSecret)
            ->postJson('/api/v1/bot/resolve-professional', [
                'telegram_chat_id' => $chatId,
            ]);
        $privacyCheckResponse->assertStatus(403)
            ->assertJsonPath('code', 'PRIVACY_POLICY_NOT_ACCEPTED');

        // Registrar aceptación de privacidad
        \App\Models\PrivacyAcceptance::create([
            'company_id' => $this->company->id,
            'user_id' => $this->nurse->id,
            'policy_version' => 'v1.0-carenote-2026',
            'accepted_at' => now(),
        ]);

        // 3. Resolución exitosa
        $successResponse = $this->withHeader('X-CareNote-Bot-Secret', $botSecret)
            ->postJson('/api/v1/bot/resolve-professional', [
                'telegram_chat_id' => $chatId,
            ]);
        $successResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('professional.id', $this->nurse->id)
            ->assertJsonPath('company.id', $this->company->id)
            ->assertJsonPath('privacy_accepted', true);

        // 4. Usuario inactivo
        $this->nurse->update(['status' => 'inactive']);
        $inactiveResponse = $this->withHeader('X-CareNote-Bot-Secret', $botSecret)
            ->postJson('/api/v1/bot/resolve-professional', [
                'telegram_chat_id' => $chatId,
            ]);
        $inactiveResponse->assertStatus(422)
            ->assertJsonPath('code', 'PROFESSIONAL_INACTIVE');
    }

    public function test_bot_care_encounter_ingestion_and_tenant_isolation(): void
    {
        $botSecret = config('services.carenote_bot.secret', 'carenote-bot-secret-dev-2026');
        $chatId = 999111222;

        // Crear vínculo y aceptación de privacidad
        \App\Models\TelegramProfessionalLink::create([
            'user_id' => $this->nurse->id,
            'telegram_chat_id' => $chatId,
            'is_verified' => true,
            'linked_at' => now(),
        ]);

        \App\Models\PrivacyAcceptance::create([
            'company_id' => $this->company->id,
            'user_id' => $this->nurse->id,
            'policy_version' => 'v1.0-carenote-2026',
            'accepted_at' => now(),
        ]);

        // Intentar ingestar con paciente de otra empresa (debe rebotar por aislamiento multiempresa)
        $otherCompany = \App\Models\Company::create(['name' => 'Otra IPS']);
        $otherClient = \App\Models\Client::create(['company_id' => $otherCompany->id, 'name' => 'Cliente Ajeno']);
        $otherPatient = \App\Models\Patient::create([
            'company_id' => $otherCompany->id,
            'client_id' => $otherClient->id,
            'name' => 'Paciente Ajeno',
        ]);

        $isolationResponse = $this->withHeader('X-CareNote-Bot-Secret', $botSecret)
            ->postJson('/api/v1/bot/care-encounters', [
                'telegram_chat_id' => $chatId,
                'patient_id' => $otherPatient->id,
                'notes_summary' => 'Intento de ingesta cruzada',
            ]);
        $isolationResponse->assertStatus(422)
            ->assertJsonPath('code', 'PATIENT_NOT_FOUND');

        // Ingesta exitosa para paciente propio
        $ingestResponse = $this->withHeader('X-CareNote-Bot-Secret', $botSecret)
            ->postJson('/api/v1/bot/care-encounters', [
                'telegram_chat_id' => $chatId,
                'patient_id' => $this->patient->id,
                'encounter_type' => 'terapia',
                'notes_summary' => 'Atención enviada por enfermera desde Telegram bot',
            ]);

        $ingestResponse->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('encounter.company_id', $this->company->id)
            ->assertJsonPath('encounter.professional_id', $this->nurse->id)
            ->assertJsonPath('encounter.patient_id', $this->patient->id)
            ->assertJsonPath('encounter.channel', 'telegram');

        $this->assertDatabaseHas('care_encounters', [
            'company_id' => $this->company->id,
            'professional_id' => $this->nurse->id,
            'patient_id' => $this->patient->id,
            'channel' => 'telegram',
            'encounter_type' => 'terapia',
        ]);
    }

    public function test_bot_session_lifecycle_multi_audio_text_and_consolidation(): void
    {
        Storage::fake('local');
        $botSecret = config('services.carenote_bot.secret', 'carenote-bot-secret-dev-2026');
        $chatId = 777333111;

        // Vinculación y privacidad previa
        \App\Models\TelegramProfessionalLink::create([
            'user_id' => $this->nurse->id,
            'telegram_chat_id' => $chatId,
            'is_verified' => true,
            'linked_at' => now(),
        ]);

        \App\Models\PrivacyAcceptance::create([
            'company_id' => $this->company->id,
            'user_id' => $this->nurse->id,
            'policy_version' => 'v1.0-carenote-2026',
            'accepted_at' => now(),
        ]);

        // 1. Iniciar Sesión
        $startResponse = $this->withHeader('X-CareNote-Bot-Secret', $botSecret)
            ->postJson('/api/v1/bot/sessions/start', [
                'telegram_chat_id' => $chatId,
                'patient_id' => $this->patient->id,
                'encounter_type' => 'atencion_domiciliaria',
            ]);

        $startResponse->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('encounter.status', 'en_proceso');

        $encounterId = $startResponse->json('encounter.id');

        // 2. Intentar iniciar una segunda sesión activa (debe rebotar 409)
        $conflictResponse = $this->withHeader('X-CareNote-Bot-Secret', $botSecret)
            ->postJson('/api/v1/bot/sessions/start', [
                'telegram_chat_id' => $chatId,
                'patient_id' => $this->patient->id,
            ]);

        $conflictResponse->assertStatus(409)
            ->assertJsonPath('code', 'ACTIVE_SESSION_EXISTS');

        // 3. Consultar sesión activa
        $activeCheckResponse = $this->withHeader('X-CareNote-Bot-Secret', $botSecret)
            ->getJson("/api/v1/bot/sessions/active?telegram_chat_id={$chatId}");

        $activeCheckResponse->assertStatus(200)
            ->assertJsonPath('has_active_session', true)
            ->assertJsonPath('encounter.id', $encounterId);

        // 4. Agregar Elemento 1: Audio (38 minutos)
        $audioFile1 = UploadedFile::fake()->create('audio1.ogg', 600, 'audio/ogg');
        $item1Response = $this->withHeader('X-CareNote-Bot-Secret', $botSecret)
            ->postJson('/api/v1/bot/sessions/items', [
                'telegram_chat_id' => $chatId,
                'item_type' => 'audio',
                'telegram_message_id' => 'msg_101',
                'duration_seconds' => 2280, // 38m
                'audio_file' => $audioFile1,
            ]);

        $item1Response->assertStatus(201)
            ->assertJsonPath('sequence_number', 1);

        $itemId1 = $item1Response->json('item.id');

        // Actualizar estado de transcripción del Audio 1
        $this->withHeader('X-CareNote-Bot-Secret', $botSecret)
            ->postJson('/api/v1/bot/sessions/items/status', [
                'item_id' => $itemId1,
                'status' => 'ready',
                'text_content' => 'Evaluación inicial de enfermería. Signos de dolor controlado.',
            ])->assertStatus(200);

        // 5. Agregar Elemento 2: Texto Libre
        $item2Response = $this->withHeader('X-CareNote-Bot-Secret', $botSecret)
            ->postJson('/api/v1/bot/sessions/items', [
                'telegram_chat_id' => $chatId,
                'item_type' => 'text',
                'telegram_message_id' => 'msg_102',
                'text_content' => 'Signos vitales: PA 120/80, FC 72, T 36.5C',
            ]);

        $item2Response->assertStatus(201)
            ->assertJsonPath('sequence_number', 2);

        // 6. Agregar Elemento 3: Audio 2 (34 minutos)
        $audioFile2 = UploadedFile::fake()->create('audio2.ogg', 500, 'audio/ogg');
        $item3Response = $this->withHeader('X-CareNote-Bot-Secret', $botSecret)
            ->postJson('/api/v1/bot/sessions/items', [
                'telegram_chat_id' => $chatId,
                'item_type' => 'audio',
                'telegram_message_id' => 'msg_103',
                'duration_seconds' => 2040, // 34m
                'audio_file' => $audioFile2,
            ]);

        $item3Response->assertStatus(201)
            ->assertJsonPath('sequence_number', 3);

        $itemId3 = $item3Response->json('item.id');

        $this->withHeader('X-CareNote-Bot-Secret', $botSecret)
            ->postJson('/api/v1/bot/sessions/items/status', [
                'item_id' => $itemId3,
                'status' => 'ready',
                'text_content' => 'Administración de analgésicos según indicación médica.',
            ])->assertStatus(200);

        // 7. Finalizar y Consolidar Sesión
        $closeResponse = $this->withHeader('X-CareNote-Bot-Secret', $botSecret)
            ->postJson('/api/v1/bot/sessions/close', [
                'telegram_chat_id' => $chatId,
                'action' => 'confirm',
            ]);

        $closeResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('summary.total_items', 3)
            ->assertJsonPath('summary.total_audios', 2)
            ->assertJsonPath('summary.total_texts', 1);

        $consolidatedText = $closeResponse->json('summary.consolidated_text');
        $this->assertStringContainsString('Evaluación inicial de enfermería', $consolidatedText);
        $this->assertStringContainsString('Signos vitales: PA 120/80', $consolidatedText);
        $this->assertStringContainsString('Administración de analgésicos', $consolidatedText);

        $this->assertDatabaseHas('care_encounters', [
            'id' => $encounterId,
            'status' => 'borrador_pendiente',
        ]);
    }

    public function test_bot_session_cancellation(): void
    {
        $botSecret = config('services.carenote_bot.secret', 'carenote-bot-secret-dev-2026');
        $chatId = 555666777;

        \App\Models\TelegramProfessionalLink::create([
            'user_id' => $this->nurse->id,
            'telegram_chat_id' => $chatId,
            'is_verified' => true,
            'linked_at' => now(),
        ]);

        \App\Models\PrivacyAcceptance::create([
            'company_id' => $this->company->id,
            'user_id' => $this->nurse->id,
            'policy_version' => 'v1.0-carenote-2026',
            'accepted_at' => now(),
        ]);

        $this->withHeader('X-CareNote-Bot-Secret', $botSecret)
            ->postJson('/api/v1/bot/sessions/start', [
                'telegram_chat_id' => $chatId,
                'patient_id' => $this->patient->id,
            ])->assertStatus(201);

        $cancelResponse = $this->withHeader('X-CareNote-Bot-Secret', $botSecret)
            ->postJson('/api/v1/bot/sessions/close', [
                'telegram_chat_id' => $chatId,
                'action' => 'cancel',
            ]);

        $cancelResponse->assertStatus(200)
            ->assertJsonPath('action', 'cancelled');
    }

    public function test_bot_segment_timer_anti_ghost_warning_status_check(): void
    {
        Storage::fake('local');
        $botSecret = config('services.carenote_bot.secret', 'carenote-bot-secret-dev-2026');
        $chatId = 444333222;
        $segmentId = 'seg_timer_test_99';

        \App\Models\TelegramProfessionalLink::create([
            'user_id' => $this->nurse->id,
            'telegram_chat_id' => $chatId,
            'is_verified' => true,
            'linked_at' => now(),
        ]);

        \App\Models\PrivacyAcceptance::create([
            'company_id' => $this->company->id,
            'user_id' => $this->nurse->id,
            'policy_version' => 'v1.0-carenote-2026',
            'accepted_at' => now(),
        ]);

        // 1. Antes de enviar audio: consulta de estado de segmento indica `is_delivered = false`
        $pendingCheck = $this->withHeader('X-CareNote-Bot-Secret', $botSecret)
            ->getJson("/api/v1/bot/sessions/items/segment-status?segment_id={$segmentId}");
        
        $pendingCheck->assertStatus(200)
            ->assertJsonPath('is_delivered', false)
            ->assertJsonPath('state', 'pending');

        // 2. Iniciar sesión
        $this->withHeader('X-CareNote-Bot-Secret', $botSecret)
            ->postJson('/api/v1/bot/sessions/start', [
                'telegram_chat_id' => $chatId,
                'patient_id' => $this->patient->id,
            ])->assertStatus(201);

        // 3. Telegram entrega el audio para ese segment_id
        $audioFile = UploadedFile::fake()->create('segment_audio.ogg', 400, 'audio/ogg');
        $this->withHeader('X-CareNote-Bot-Secret', $botSecret)
            ->postJson('/api/v1/bot/sessions/items', [
                'telegram_chat_id' => $chatId,
                'item_type' => 'audio',
                'segment_id' => $segmentId,
                'duration_seconds' => 1200, // 20m
                'audio_file' => $audioFile,
            ])->assertStatus(201);

        // 4. El temporizador de n8n consulta el estado del segmento antes de enviar una alerta de 35 min
        $deliveredCheck = $this->withHeader('X-CareNote-Bot-Secret', $botSecret)
            ->getJson("/api/v1/bot/sessions/items/segment-status?segment_id={$segmentId}");

        $deliveredCheck->assertStatus(200)
            ->assertJsonPath('is_delivered', true)
            ->assertJsonPath('state', 'received');
        // n8n detecta `is_delivered = true` y cancela el aviso fantasma silenciosamente
    }

    public function test_bot_session_partial_failure_and_item_retry_resilience(): void
    {
        Storage::fake('local');
        $botSecret = config('services.carenote_bot.secret', 'carenote-bot-secret-dev-2026');
        $chatId = 111222333;

        \App\Models\TelegramProfessionalLink::create([
            'user_id' => $this->nurse->id,
            'telegram_chat_id' => $chatId,
            'is_verified' => true,
            'linked_at' => now(),
        ]);

        \App\Models\PrivacyAcceptance::create([
            'company_id' => $this->company->id,
            'user_id' => $this->nurse->id,
            'policy_version' => 'v1.0-carenote-2026',
            'accepted_at' => now(),
        ]);

        $this->withHeader('X-CareNote-Bot-Secret', $botSecret)
            ->postJson('/api/v1/bot/sessions/start', [
                'telegram_chat_id' => $chatId,
                'patient_id' => $this->patient->id,
            ])->assertStatus(201);

        // Elemento 1: Audio 1 (completado)
        $audio1 = UploadedFile::fake()->create('a1.ogg', 200, 'audio/ogg');
        $item1Res = $this->withHeader('X-CareNote-Bot-Secret', $botSecret)
            ->postJson('/api/v1/bot/sessions/items', [
                'telegram_chat_id' => $chatId,
                'item_type' => 'audio',
                'audio_file' => $audio1,
            ]);
        $itemId1 = $item1Res->json('item.id');

        $this->withHeader('X-CareNote-Bot-Secret', $botSecret)
            ->postJson('/api/v1/bot/sessions/items/status', [
                'item_id' => $itemId1,
                'status' => 'ready',
                'text_content' => 'Transcripción exitosa del Audio 1.',
            ]);

        // Elemento 2: Audio 2 (falla por timeout de red)
        $audio2 = UploadedFile::fake()->create('a2.ogg', 300, 'audio/ogg');
        $item2Res = $this->withHeader('X-CareNote-Bot-Secret', $botSecret)
            ->postJson('/api/v1/bot/sessions/items', [
                'telegram_chat_id' => $chatId,
                'item_type' => 'audio',
                'audio_file' => $audio2,
            ]);
        $itemId2 = $item2Res->json('item.id');

        $this->withHeader('X-CareNote-Bot-Secret', $botSecret)
            ->postJson('/api/v1/bot/sessions/items/status', [
                'item_id' => $itemId2,
                'status' => 'failed',
                'error_message' => 'Timeout de red en el proveedor de transcripción.',
            ]);

        // Intentar cerrar la sesión mientras Audio 2 esté fallido (debe rebotar 422 ITEMS_NOT_READY)
        $failedClose = $this->withHeader('X-CareNote-Bot-Secret', $botSecret)
            ->postJson('/api/v1/bot/sessions/close', [
                'telegram_chat_id' => $chatId,
                'action' => 'confirm',
            ]);
        $failedClose->assertStatus(422)
            ->assertJsonPath('code', 'ITEMS_NOT_READY');

        // Reintentar ÚNICAMENTE el Audio 2 (sin volver a procesar Audio 1)
        $this->withHeader('X-CareNote-Bot-Secret', $botSecret)
            ->postJson('/api/v1/bot/sessions/items/status', [
                'item_id' => $itemId2,
                'status' => 'ready',
                'text_content' => 'Transcripción exitosa del Audio 2 tras reintento.',
            ])->assertStatus(200);

        // Ahora cerrar sesión exitosamente
        $successClose = $this->withHeader('X-CareNote-Bot-Secret', $botSecret)
            ->postJson('/api/v1/bot/sessions/close', [
                'telegram_chat_id' => $chatId,
                'action' => 'confirm',
            ]);

        $successClose->assertStatus(200)
            ->assertJsonPath('success', true);

        $text = $successClose->json('summary.consolidated_text');
        $this->assertStringContainsString('Transcripción exitosa del Audio 1', $text);
        $this->assertStringContainsString('Transcripción exitosa del Audio 2 tras reintento', $text);
    }
}
