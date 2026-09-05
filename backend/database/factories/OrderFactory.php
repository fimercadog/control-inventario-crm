<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\Company;
use App\Models\Order;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'client_id' => Client::factory(),
            'deal_id' => null,
            'warehouse_id' => Warehouse::factory(),
            'status' => 'draft',
            'total' => 0,
        ];
    }
}
