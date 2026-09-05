<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\Company;
use App\Models\Deal;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Deal>
 */
class DealFactory extends Factory
{
    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'client_id' => Client::factory(),
            'title' => $this->faker->bs(),
            'amount' => $this->faker->randomFloat(2, 500, 20000),
            'stage' => $this->faker->randomElement(['prospecting', 'qualification', 'proposal', 'negotiation', 'won', 'lost']),
            'expected_close_date' => $this->faker->dateTimeBetween('now', '+3 months'),
        ];
    }
}
