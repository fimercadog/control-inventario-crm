<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        $cost = $this->faker->randomFloat(2, 5, 500);

        return [
            'company_id' => Company::factory(),
            'sku' => strtoupper($this->faker->bothify('SKU-####??')),
            'name' => $this->faker->words(3, true),
            'category' => $this->faker->randomElement(['General', 'Electronica', 'Oficina', 'Aseo']),
            'unit' => 'unidad',
            'unit_price' => round($cost * 1.4, 2),
            'cost_price' => $cost,
            'reorder_level' => $this->faker->numberBetween(5, 30),
            'status' => 'active',
        ];
    }
}
