<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,      // First: seed roles
            UserSeeder::class,      // Second: seed users and assign roles
            CategorySeeder::class,
            TagSeeder::class,
        ]);
    }
}
