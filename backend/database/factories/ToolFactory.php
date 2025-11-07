<?php

namespace Database\Factories;

use App\Models\Tool;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ToolFactory extends Factory
{
    protected $model = Tool::class;

    public function definition(): array
    {
        $name = $this->faker->words(3, true);
        
        return [
            'user_id' => User::factory(),
            'name' => ucfirst($name),
            'slug' => Str::slug($name),
            'description' => $this->faker->sentence(20),
            'link' => $this->faker->url(),
            'status' => 'approved',
            'is_featured' => false,
            'views_count' => $this->faker->numberBetween(0, 1000),
            'average_rating' => 0,
            'ratings_count' => 0,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected',
        ]);
    }

    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
        ]);
    }
}
