<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrustedDevice extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'user_id',
        'device_token',
        'device_name',
        'device_fingerprint',
        'ip_address',
        'user_agent',
        'last_used_at',
        'expires_at',
    ];

    protected $casts = [
        'last_used_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    /**
     * Get the user that owns the trusted device
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if the device trust has expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at < now();
    }

    /**
     * Update the last used timestamp
     */
    public function touch($attribute = null)
    {
        $this->last_used_at = now();
        return parent::touch($attribute);
    }
}
