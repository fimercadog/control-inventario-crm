<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    private const CARENOTE_PERMISSIONS = [
        'care_encounters.manage',
        'care_encounters.view',
        'clinical_notes.manage',
        'clinical_notes.view',
        'audio_recordings.manage',
        'privacy_acceptances.view',
    ];

    private const ADMIN_ROLES = ['Super Admin', 'Administrador de empresa'];

    private const CARENOTE_ROLES = [
        'Enfermera/o' => [
            'dashboard.view', 'patients.manage', 'appointments.manage',
            'care_encounters.manage', 'care_encounters.view',
            'clinical_notes.manage', 'clinical_notes.view',
            'audio_recordings.manage',
        ],
        'Coordinador/a de Enfermería' => [
            'dashboard.view', 'patients.manage', 'appointments.manage',
            'care_encounters.manage', 'care_encounters.view',
            'clinical_notes.manage', 'clinical_notes.view',
            'audio_recordings.manage', 'privacy_acceptances.view',
            'reports.view', 'users.manage',
        ],
    ];

    public function up(): void
    {
        // 1. Campos adicionales de atención humana en tabla `patients`
        Schema::table('patients', function (Blueprint $table) {
            if (!Schema::hasColumn('patients', 'document_type')) {
                $table->string('document_type')->nullable()->after('client_id');
                $table->string('document_number')->nullable()->after('document_type');
                $table->string('first_name')->nullable()->after('document_number');
                $table->string('last_name')->nullable()->after('first_name');
                $table->string('address')->nullable()->after('birth_date');
                $table->string('city')->nullable()->after('address');
                $table->string('phone')->nullable()->after('city');
                $table->string('emergency_contact_name')->nullable()->after('phone');
                $table->string('emergency_contact_phone')->nullable()->after('emergency_contact_name');
                $table->string('health_coverage_provider')->nullable()->after('emergency_contact_phone');
                $table->text('medical_history_summary')->nullable()->after('health_coverage_provider');
            }
        });

        // 2. Tabla vinculación Telegram <-> Usuario
        Schema::create('telegram_professional_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->bigInteger('telegram_chat_id')->nullable()->unique();
            $table->bigInteger('telegram_user_id')->nullable();
            $table->string('telegram_username')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->string('verification_pin', 10)->nullable();
            $table->timestamp('linked_at')->nullable();
            $table->timestamps();

            $table->index('telegram_chat_id');
        });

        // 3. Tabla aceptación de políticas de privacidad
        Schema::create('privacy_acceptances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->bigInteger('telegram_chat_id')->nullable();
            $table->string('policy_version');
            $table->timestamp('accepted_at');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'user_id']);
            $table->index(['company_id', 'telegram_chat_id']);
        });

        // 4. Tabla de atenciones clínicas (CareEncounter)
        Schema::create('care_encounters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained()->restrictOnDelete();
            $table->foreignId('professional_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('appointment_id')->nullable()->constrained('appointments')->nullOnDelete();
            $table->string('encounter_code')->unique();
            $table->dateTime('started_at');
            $table->dateTime('completed_at')->nullable();
            $table->string('encounter_type')->default('atencion_domiciliaria'); // atencion_domiciliaria | terapia | procedimiento | asistencia
            $table->string('channel')->default('telegram'); // telegram | web
            $table->string('status')->default('en_proceso'); // en_proceso | borrador_pendiente | revisada | cerrada
            $table->text('notes_summary')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['company_id', 'patient_id']);
            $table->index(['company_id', 'professional_id']);
            $table->index(['company_id', 'status']);
        });

        // 5. Tabla de grabaciones de audio (AudioRecording)
        Schema::create('audio_recordings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('care_encounter_id')->constrained()->cascadeOnDelete();
            $table->string('telegram_file_id')->nullable();
            $table->string('original_filename');
            $table->string('file_path');
            $table->bigInteger('file_size_bytes');
            $table->string('mime_type')->default('audio/ogg');
            $table->integer('duration_seconds')->nullable();
            $table->string('sha256_hash', 64)->nullable();
            $table->string('status')->default('recibido'); // recibido | almacenado | dividido | transcribiendo | completado | error
            $table->text('error_message')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['company_id', 'care_encounter_id']);
            $table->index('status');
        });

        // 6. Tabla de fragmentos de audio para audios largos (AudioChunk)
        Schema::create('audio_chunks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('audio_recording_id')->constrained()->cascadeOnDelete();
            $table->integer('chunk_index');
            $table->string('file_path');
            $table->integer('duration_seconds');
            $table->integer('start_offset_sec');
            $table->integer('end_offset_sec');
            $table->string('status')->default('pendiente'); // pendiente | transcribiendo | completado | error
            $table->text('transcript_text')->nullable();
            $table->timestamps();

            $table->index(['audio_recording_id', 'chunk_index']);
        });

        // 7. Tabla de transcripciones consolidadas (Transcript)
        Schema::create('transcripts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('audio_recording_id')->constrained()->cascadeOnDelete();
            $table->longText('raw_text');
            $table->string('transcription_provider')->default('whisper_api');
            $table->string('language', 10)->default('es');
            $table->decimal('confidence_score', 5, 2)->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->index('audio_recording_id');
        });

        // 8. Tabla de notas clínicas estructuradas (ClinicalNote)
        Schema::create('clinical_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('care_encounter_id')->constrained()->cascadeOnDelete();
            $table->foreignId('transcript_id')->nullable()->constrained()->nullOnDelete();
            $table->string('template_type')->default('soap'); // soap | nursing_evolution | procedure | vitals | free_text
            $table->string('note_status')->default('BORRADOR'); // BORRADOR | REVISADA | CERRADA
            $table->string('title')->nullable();
            $table->text('summary_text')->nullable();
            $table->json('structured_content_json')->nullable();
            $table->json('vitals_json')->nullable();
            $table->json('ai_uncertainties_json')->nullable();
            $table->foreignId('confirmed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('confirmed_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['company_id', 'care_encounter_id']);
            $table->index(['company_id', 'note_status']);
        });

        // 9. Tabla de versiones de notas (NoteVersion)
        Schema::create('note_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinical_note_id')->constrained()->cascadeOnDelete();
            $table->integer('version_number');
            $table->json('snapshot_json');
            $table->foreignId('changed_by_user_id')->constrained('users')->restrictOnDelete();
            $table->string('change_type')->default('ai_draft'); // ai_draft | human_edit | confirmation
            $table->timestamps();

            $table->index(['clinical_note_id', 'version_number']);
        });

        // 10. Tabla de adendas a notas cerradas (NoteAddendum)
        Schema::create('note_addendums', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinical_note_id')->constrained()->cascadeOnDelete();
            $table->foreignId('author_user_id')->constrained('users')->restrictOnDelete();
            $table->text('addendum_text');
            $table->string('reason');
            $table->timestamps();

            $table->index('clinical_note_id');
        });

        // 11. Permisos y Roles de CareNote
        $now = now();
        foreach (self::CARENOTE_PERMISSIONS as $name) {
            DB::table('permissions')->updateOrInsert(
                ['name' => $name, 'guard_name' => 'web'],
                ['updated_at' => $now, 'created_at' => $now],
            );
        }

        $permissionId = fn (string $name) => DB::table('permissions')
            ->where(['name' => $name, 'guard_name' => 'web'])->value('id');

        $grant = function (int $roleId, array $permissionNames) use ($permissionId): void {
            foreach ($permissionNames as $name) {
                $pid = $permissionId($name);
                if ($pid === null) {
                    continue;
                }
                DB::table('role_has_permissions')->updateOrInsert(
                    ['permission_id' => $pid, 'role_id' => $roleId],
                    [],
                );
            }
        };

        // Permisos de CareNote a administradores
        $adminRoleIds = DB::table('roles')->where('guard_name', 'web')
            ->whereIn('name', self::ADMIN_ROLES)->pluck('id');
        foreach ($adminRoleIds as $roleId) {
            $grant((int) $roleId, self::CARENOTE_PERMISSIONS);
        }

        // Roles de CareNote
        foreach (self::CARENOTE_ROLES as $roleName => $permissions) {
            DB::table('roles')->updateOrInsert(
                ['name' => $roleName, 'guard_name' => 'web'],
                ['status' => 'active', 'updated_at' => $now, 'created_at' => $now],
            );
            $roleId = (int) DB::table('roles')->where(['name' => $roleName, 'guard_name' => 'web'])->value('id');
            $grant($roleId, $permissions);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        Schema::dropIfExists('note_addendums');
        Schema::dropIfExists('note_versions');
        Schema::dropIfExists('clinical_notes');
        Schema::dropIfExists('transcripts');
        Schema::dropIfExists('audio_chunks');
        Schema::dropIfExists('audio_recordings');
        Schema::dropIfExists('care_encounters');
        Schema::dropIfExists('privacy_acceptances');
        Schema::dropIfExists('telegram_professional_links');

        Schema::table('patients', function (Blueprint $table) {
            if (Schema::hasColumn('patients', 'document_type')) {
                $table->dropColumn([
                    'document_type', 'document_number', 'first_name', 'last_name',
                    'address', 'city', 'phone', 'emergency_contact_name',
                    'emergency_contact_phone', 'health_coverage_provider', 'medical_history_summary',
                ]);
            }
        });

        DB::table('roles')->where('guard_name', 'web')
            ->whereIn('name', array_keys(self::CARENOTE_ROLES))->delete();

        $permissionIds = DB::table('permissions')->where('guard_name', 'web')
            ->whereIn('name', self::CARENOTE_PERMISSIONS)->pluck('id');

        DB::table('role_has_permissions')->whereIn('permission_id', $permissionIds)->delete();
        DB::table('model_has_permissions')->whereIn('permission_id', $permissionIds)->delete();
        DB::table('permissions')->whereIn('id', $permissionIds)->delete();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
