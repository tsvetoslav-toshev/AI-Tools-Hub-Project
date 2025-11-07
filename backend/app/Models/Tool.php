<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Tool extends Model
{
    use SoftDeletes, HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'link',
        'documentation_link',
        'description',
        'how_to_use',
        'real_examples',
        'user_id',
        'status',
        'approved_by',
        'reviewed_at',
        'is_approved',
        'is_featured',
        'views_count',
        'average_rating',
        'ratings_count',
    ];

    protected $casts = [
        'is_approved' => 'boolean',
        'is_featured' => 'boolean',
        'views_count' => 'integer',
        'reviewed_at' => 'datetime',
        'average_rating' => 'decimal:2',
        'ratings_count' => 'integer',
    ];

    // Use camelCase for relationship serialization
    protected $appends = [];
    
    // Override relationship key name for JSON serialization
    public function getRecommendedForUsersAttribute()
    {
        return $this->relationLoaded('recommendedForUsers') 
            ? $this->getRelation('recommendedForUsers') 
            : [];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($tool) {
            if (empty($tool->slug)) {
                $baseSlug = Str::slug($tool->name);
                $slug = $baseSlug;
                $counter = 1;
                
                // Keep incrementing counter until we find a unique slug
                while (static::where('slug', $slug)->exists()) {
                    $slug = $baseSlug . '-' . $counter;
                    $counter++;
                }
                
                $tool->slug = $slug;
            }
        });
    }

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'tool_category')
            ->withTimestamps();
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'tool_tag')
            ->withTimestamps();
    }

    public function recommendedForUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'tool_user')
            ->withPivot('recommended_role')
            ->withTimestamps();
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)->whereNull('parent_id')->latest();
    }

    // Scopes
    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }


    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where('name', 'like', "%{$search}%")
            ->orWhere('description', 'like', "%{$search}%");
    }
}
