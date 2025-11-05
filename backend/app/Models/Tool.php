<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Tool extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'link',
        'documentation_link',
        'description',
        'how_to_use',
        'real_examples',
        'user_id',
        'is_approved',
        'is_featured',
        'views_count',
    ];

    protected $casts = [
        'is_approved' => 'boolean',
        'is_featured' => 'boolean',
        'views_count' => 'integer',
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
                $tool->slug = Str::slug($tool->name);
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

    // Scopes
    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
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
