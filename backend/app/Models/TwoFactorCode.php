<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TwoFactorCode extends Model
{
    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'code_hash',
        'expires_at',
        'consumed_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'consumed_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    /**
     * Get the user that owns the 2FA code.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get only valid (not expired, not consumed) codes.
     */
    public function scopeValid($query)
    {
        return $query->where('expires_at', '>', now())
                    ->whereNull('consumed_at');
    }

    /**
     * Scope to get codes for a specific user.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Check if the code is expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Check if the code has been consumed.
     */
    public function isConsumed(): bool
    {
        return $this->consumed_at !== null;
    }

    /**
     * Mark the code as consumed.
     */
    public function markAsConsumed(): void
    {
        $this->consumed_at = now();
        $this->save();
    }
}
