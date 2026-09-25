<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayrollDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'payroll_id',
        'employee_id',
        'base_salary',
        'worked_days',
        'transport_subsidy',
        'overtime_amount',
        'bonuses_amount',
        'total_accrued',
        'health_deduction',
        'pension_deduction',
        'other_deductions',
        'total_deductions',
        'net_payable',
        'concepts_json',
        'status',
        'account_payable_id',
    ];

    protected $casts = [
        'base_salary' => 'decimal:2',
        'transport_subsidy' => 'decimal:2',
        'overtime_amount' => 'decimal:2',
        'bonuses_amount' => 'decimal:2',
        'total_accrued' => 'decimal:2',
        'health_deduction' => 'decimal:2',
        'pension_deduction' => 'decimal:2',
        'other_deductions' => 'decimal:2',
        'total_deductions' => 'decimal:2',
        'net_payable' => 'decimal:2',
        'concepts_json' => 'array',
    ];

    public function payroll(): BelongsTo
    {
        return $this->belongsTo(Payroll::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function accountPayable(): BelongsTo
    {
        return $this->belongsTo(AccountPayable::class);
    }
}
