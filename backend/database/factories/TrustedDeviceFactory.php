<?php

namespace Database\Factories;

use App\Models\TrustedDevice;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TrustedDeviceFactory extends Factory
{
    protected $model = TrustedDevice::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'device_token' => hash('sha256', $this->faker->uuid()),
            'device_name' => $this->faker->randomElement([
                'Chrome on Windows',
                'Firefox on Mac',
                'Safari on iPhone',
                'Edge on Windows',
                'Chrome on Android',
            ]),
            'device_fingerprint' => hash('sha256', $this->faker->uuid()),
            'ip_address' => $this->faker->ipv4(),
            'user_agent' => $this->faker->userAgent(),
            'last_used_at' => now(),
            'expires_at' => now()->addDays(30),
        ];
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'expires_at' => now()->subDay(),
            'last_used_at' => now()->subDays(31),
        ]);
    }
}
