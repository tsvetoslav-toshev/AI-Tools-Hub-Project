<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'AI & Machine Learning',
                'description' => 'Tools for artificial intelligence, machine learning, and neural networks',
                'icon' => '🤖',
                'order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Backend Development',
                'description' => 'Server-side frameworks, APIs, and backend tools',
                'icon' => '⚙️',
                'order' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'Frontend Development',
                'description' => 'UI frameworks, libraries, and frontend tools',
                'icon' => '🎨',
                'order' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'DevOps & Cloud',
                'description' => 'Deployment, CI/CD, infrastructure, and cloud services',
                'icon' => '☁️',
                'order' => 4,
                'is_active' => true,
            ],
            [
                'name' => 'Data Science',
                'description' => 'Data analysis, visualization, and big data tools',
                'icon' => '📊',
                'order' => 5,
                'is_active' => true,
            ],
            [
                'name' => 'Design & UI/UX',
                'description' => 'Design tools, prototyping, and user experience',
                'icon' => '✨',
                'order' => 6,
                'is_active' => true,
            ],
            [
                'name' => 'Testing & QA',
                'description' => 'Testing frameworks, automation, and quality assurance',
                'icon' => '🧪',
                'order' => 7,
                'is_active' => true,
            ],
            [
                'name' => 'Database & Storage',
                'description' => 'Databases, ORM tools, and data storage solutions',
                'icon' => '💾',
                'order' => 8,
                'is_active' => true,
            ],
            [
                'name' => 'Security & Auth',
                'description' => 'Security tools, authentication, and encryption',
                'icon' => '🔒',
                'order' => 9,
                'is_active' => true,
            ],
            [
                'name' => 'Productivity',
                'description' => 'Development productivity, code editors, and utilities',
                'icon' => '⚡',
                'order' => 10,
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
