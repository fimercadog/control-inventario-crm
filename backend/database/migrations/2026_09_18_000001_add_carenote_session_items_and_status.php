<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('care_encounter_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('care_encounter_id')->constrained()->cascadeOnDelete();
            $table->integer('sequence_number');
            $table->string('item_type')->default('audio'); // audio | text
            $table->string('segment_id')->nullable()->index();
            $table->string('telegram_message_id')->nullable();
            $table->text('text_content')->nullable();
            $table->foreignId('audio_recording_id')->nullable()->constrained('audio_recordings')->nullOnDelete();
            $table->integer('duration_seconds')->nullable();
            $table->bigInteger('file_size_bytes')->nullable();
            $table->string('status')->default('received'); // received | downloading | preparing | transcribing | ready | failed
            $table->text('error_message')->nullable();
            $table->boolean('auto_created')->default(false);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('received_at')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'care_encounter_id']);
            $table->index(['care_encounter_id', 'sequence_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('care_encounter_items');
    }
};
