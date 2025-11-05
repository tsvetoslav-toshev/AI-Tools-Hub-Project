<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ToolResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'link' => $this->link,
            'documentation_link' => $this->documentation_link,
            'description' => $this->description,
            'how_to_use' => $this->how_to_use,
            'real_examples' => $this->real_examples,
            'is_approved' => $this->is_approved,
            'is_featured' => $this->is_featured,
            'views_count' => $this->views_count,
            'created_at' => $this->created_at,
            'user' => $this->whenLoaded('user'),
            'categories' => $this->whenLoaded('categories'),
            'tags' => $this->whenLoaded('tags'),
            'recommendedForUsers' => $this->whenLoaded('recommendedForUsers', function() {
                return $this->recommendedForUsers;
            }, []),
        ];
    }
}
