<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Destinos Turísticos
        Schema::create('travel_destinations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->nullable();
            $table->string('country');
            $table->string('city');
            $table->string('season')->nullable();
            $table->text('description')->nullable();
            $table->text('highlights')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->string('image_url')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
        });

        // 2. Paquetes Turísticos
        Schema::create('travel_packages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('destination_id')->nullable()->constrained('travel_destinations')->nullOnDelete();
            $table->string('name');
            $table->string('code')->nullable();
            $table->integer('duration_days')->default(1);
            $table->integer('duration_nights')->default(0);
            $table->date('departure_date')->nullable();
            $table->decimal('price', 12, 2)->default(0);
            $table->integer('available_slots')->default(10);
            $table->text('includes')->nullable();
            $table->text('excludes')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->string('image_url')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
        });

        // 3. Viajeros (Asociados a Cliente)
        Schema::create('travel_travelers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('client_id')->nullable()->constrained('clients')->nullOnDelete();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('document_type')->default('CC');
            $table->string('document_number');
            $table->string('passport_number')->nullable();
            $table->date('passport_expiration')->nullable();
            $table->string('nationality')->default('Colombiana');
            $table->date('birth_date')->nullable();
            $table->string('gender')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('special_requirements')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
        });

        // 4. Reservas de Viaje
        Schema::create('travel_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('booking_number')->unique();
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
            $table->foreignId('package_id')->nullable()->constrained('travel_packages')->nullOnDelete();
            $table->foreignId('destination_id')->nullable()->constrained('travel_destinations')->nullOnDelete();
            $table->date('travel_date');
            $table->date('return_date')->nullable();
            $table->integer('num_travelers')->default(1);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->decimal('paid_amount', 12, 2)->default(0);
            $table->decimal('pending_amount', 12, 2)->default(0);
            $table->string('status')->default('quoted'); // quoted, reserved, pending_payment, confirmed, traveling, completed, cancelled, expired
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); // Asesor responsable
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Tabla pivote Viajeros <-> Reserva
        Schema::create('travel_booking_travelers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('travel_bookings')->cascadeOnDelete();
            $table->foreignId('traveler_id')->constrained('travel_travelers')->cascadeOnDelete();
            $table->timestamps();
        });

        // 5. Itinerarios
        Schema::create('travel_itineraries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('booking_id')->nullable()->constrained('travel_bookings')->cascadeOnDelete();
            $table->foreignId('package_id')->nullable()->constrained('travel_packages')->cascadeOnDelete();
            $table->integer('day_number')->default(1);
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('activity_date')->nullable();
            $table->string('location')->nullable();
            $table->text('included_services')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 6. Servicios Turísticos de la Reserva (Vuelo, Hotel, Tour, Seguro, Transfer)
        Schema::create('travel_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('booking_id')->constrained('travel_bookings')->cascadeOnDelete();
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
            $table->string('service_type')->default('hotel'); // flight, hotel, transfer, tour, insurance, other
            $table->string('name');
            $table->string('supplier_reference')->nullable();
            $table->dateTime('start_date')->nullable();
            $table->dateTime('end_date')->nullable();
            $table->decimal('cost_price', 12, 2)->default(0);
            $table->decimal('selling_price', 12, 2)->default(0);
            $table->string('status')->default('confirmed');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 7. Documentos de Viaje (Vouchers, Tiquetes, Itinerarios PDF)
        Schema::create('travel_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('booking_id')->constrained('travel_bookings')->cascadeOnDelete();
            $table->string('document_type')->default('voucher'); // voucher, flight_ticket, hotel_confirmation, insurance_policy, itinerary_pdf
            $table->string('title');
            $table->string('document_number')->nullable();
            $table->string('file_url')->nullable();
            $table->timestamp('issued_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('travel_documents');
        Schema::dropIfExists('travel_services');
        Schema::dropIfExists('travel_itineraries');
        Schema::dropIfExists('travel_booking_travelers');
        Schema::dropIfExists('travel_bookings');
        Schema::dropIfExists('travel_travelers');
        Schema::dropIfExists('travel_packages');
        Schema::dropIfExists('travel_destinations');
    }
};
