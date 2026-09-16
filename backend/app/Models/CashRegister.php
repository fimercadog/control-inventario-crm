<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CashRegister extends Model
{
    protected $fillable = ['company_id', 'name', 'status'];

    public function sessions(): HasMany
    {
        return $this->hasMany(CashSession::class);
    }
}
