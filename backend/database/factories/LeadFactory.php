<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Lead;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Lead>
 */
class LeadFactory extends Factory
{
    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'name' => $this->faker->name(),
            'company_name' => $this->faker->company(),
            'email' => $this->faker->safeEmail(),
            'phone' => $this->faker->phoneNumber(),
            'employee_count' => $this->faker->randomElement(['1-10', '11-50', '51-200', '200+']),
            'priority_module' => $this->faker->randomElement(['crm', 'inventario']),
            'message' => $this->faker->sentence(),
            'source' => $this->faker->randomElement(['contact', 'demo']),
            'status' => $this->faker->randomElement(['new', 'contacted', 'discarded']),
            'ip_address' => $this->faker->ipv4(),
        ];
    }
}
