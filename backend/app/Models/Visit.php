<?php

namespace App\Models;

use App\Enums\VisitStatus;
use Database\Factories\VisitFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Visit extends Model
{
    /** @use HasFactory<VisitFactory> */
    use HasFactory;

    protected $fillable = [
        'company_id',
        'property_id',
        'client_id',
        'agent_id',
        'scheduled_at',
        'status',
        'notes',
        'result',
        'follow_up',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'status' => VisitStatus::class,
        ];
    }

    /**
     * @return BelongsTo<Property, $this>
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    /**
     * @return BelongsTo<Client, $this>
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }
}
