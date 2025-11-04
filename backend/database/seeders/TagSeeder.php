<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Tag;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tags = [
            ['name' => 'Open Source', 'color' => '#22C55E'],
            ['name' => 'Free', 'color' => '#3B82F6'],
            ['name' => 'Premium', 'color' => '#F59E0B'],
            ['name' => 'SaaS', 'color' => '#8B5CF6'],
            ['name' => 'API', 'color' => '#EF4444'],
            ['name' => 'CLI', 'color' => '#14B8A6'],
            ['name' => 'Web-based', 'color' => '#06B6D4'],
            ['name' => 'Desktop', 'color' => '#6366F1'],
            ['name' => 'Mobile', 'color' => '#EC4899'],
            ['name' => 'Cross-platform', 'color' => '#10B981'],
            ['name' => 'TypeScript', 'color' => '#3178C6'],
            ['name' => 'Python', 'color' => '#3776AB'],
            ['name' => 'JavaScript', 'color' => '#F7DF1E'],
            ['name' => 'PHP', 'color' => '#777BB4'],
            ['name' => 'Go', 'color' => '#00ADD8'],
            ['name' => 'Rust', 'color' => '#000000'],
            ['name' => 'No-code', 'color' => '#A78BFA'],
            ['name' => 'Low-code', 'color' => '#C084FC'],
            ['name' => 'Enterprise', 'color' => '#64748B'],
            ['name' => 'Beginner-friendly', 'color' => '#84CC16'],
        ];

        foreach ($tags as $tag) {
            Tag::create($tag);
        }
    }
}
