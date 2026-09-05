<?php

namespace Database\Factories;

use App\Models\Activity;
use App\Models\Client;
use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Activity>
 */
class ActivityFactory extends Factory
{
    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'client_id' => Client::factory(),
            'deal_id' => null,
            'type' => $this->faker->randomElement(['call', 'meeting', 'email', 'note']),
            'subject' => $this->faker->sentence(4),
            'notes' => $this->faker->optional()->paragraph(),
            'due_date' => $this->faker->dateTimeBetween('now', '+1 month'),
            'completed' => $this->faker->boolean(30),
        ];
    }
}
