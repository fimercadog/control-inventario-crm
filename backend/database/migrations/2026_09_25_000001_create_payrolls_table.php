<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('payroll_code')->unique();
            $table->date('period_start');
            $table->date('period_end');
            $table->string('payroll_type')->default('mensual'); // mensual | quincenal
            $table->string('status')->default('BORRADOR'); // BORRADOR | CALCULADA | APROBADA | PAGADA | CERRADA
            $table->decimal('total_accrued', 12, 2)->default(0);
            $table->decimal('total_deductions', 12, 2)->default(0);
            $table->decimal('total_net', 12, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamp('calculated_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['company_id', 'status']);
        });

        Schema::create('payroll_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->restrictOnDelete();
            $table->decimal('base_salary', 12, 2);
            $table->integer('worked_days')->default(30);
            $table->decimal('transport_subsidy', 12, 2)->default(0);
            $table->decimal('overtime_amount', 12, 2)->default(0);
            $table->decimal('bonuses_amount', 12, 2)->default(0);
            $table->decimal('total_accrued', 12, 2)->default(0);
            $table->decimal('health_deduction', 12, 2)->default(0);
            $table->decimal('pension_deduction', 12, 2)->default(0);
            $table->decimal('other_deductions', 12, 2)->default(0);
            $table->decimal('total_deductions', 12, 2)->default(0);
            $table->decimal('net_payable', 12, 2)->default(0);
            $table->json('concepts_json')->nullable();
            $table->string('status')->default('calculado'); // calculado | pagado
            $table->foreignId('account_payable_id')->nullable()->constrained('accounts_payable')->nullOnDelete();
            $table->timestamps();

            $table->index(['payroll_id', 'employee_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payroll_details');
        Schema::dropIfExists('payrolls');
    }
};
