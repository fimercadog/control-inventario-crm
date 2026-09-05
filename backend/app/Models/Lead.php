<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Lead extends Model
{
    /** @use HasFactory<\Database\Factories\LeadFactory> */
    use HasFactory;

    protected $fillable = [
        'company_id', 'name', 'company_name', 'email', 'phone', 'employee_count',
        'priority_module', 'message', 'source', 'status', 'ip_address',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
