<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Alexandra Ivanova',
                'email' => 'alexandra@admin.local',
                'role' => 'owner',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'roles' => ['admin'], // Full access to everything
            ],
            [
                'name' => 'Иван Иванов',
                'email' => 'ivan@moderator.local',
                'role' => 'moderator',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'roles' => ['moderator'], // Can manage tools, no user management
            ],
            [
                'name' => 'Елена Петрова',
                'email' => 'elena@frontend.local',
                'role' => 'frontend',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'roles' => ['user'], // Basic user access
            ],
            [
                'name' => 'Петър Георгиев',
                'email' => 'petar@backend.local',
                'role' => 'backend',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'roles' => ['user'], // Basic user access
            ],
        ];

        foreach ($users as $userData) {
            $roles = $userData['roles'] ?? [];
            unset($userData['roles']);
            
            $user = User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );

            // Assign RBAC roles
            foreach ($roles as $roleName) {
                if (!$user->hasRole($roleName)) {
                    $user->assignRole($roleName);
                }
            }
        }

        $this->command->info('Successfully seeded ' . count($users) . ' users with roles!');
    }
}
