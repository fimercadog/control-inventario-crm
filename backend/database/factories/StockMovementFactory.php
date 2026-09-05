<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StockMovement>
 */
class StockMovementFactory extends Factory
{
    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'product_id' => Product::factory(),
            'warehouse_id' => Warehouse::factory(),
            'type' => 'in',
            'quantity' => $this->faker->numberBetween(1, 50),
            'reason' => 'Ajuste inicial',
            'reference' => null,
        ];
    }
}
