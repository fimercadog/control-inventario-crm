<?php

namespace App\Models;

use Database\Factories\ClientFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * El dueño (Client) es también el usuario del portal público (S14): sin
 * password, entra por enlace mágico (PortalAuthController) sobre el guard
 * `client` (config/auth.php). Authenticatable ya extiende Model, así que
 * todo lo que ya asumía "Client is a Model" sigue funcionando igual.
 */
class Client extends Authenticatable
{
    /** @use HasFactory<ClientFactory> */
    use HasFactory, Notifiable;

    protected $fillable = ['company_id', 'segment_id', 'name', 'company_name', 'email', 'phone', 'address', 'status', 'notes'];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function segment(): BelongsTo
    {
        return $this->belongsTo(Segment::class);
    }

    public function deals(): HasMany
    {
        return $this->hasMany(Deal::class);
    }

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function patients(): HasMany
    {
        return $this->hasMany(Patient::class);
    }
}
