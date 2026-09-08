<?php

namespace Database\Seeders;

use App\Models\InventoryProduct;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Service;
use Illuminate\Database\Seeder;

class ProductServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            [
                'name' => 'Garment Cutting & Sewing',
                'category' => 'Apparel',
                'unit' => 'Pieces',
                'costs' => ['workmanship_cost' => 15, 'machine_maintenance_cost' => 3, 'process_cost' => 2, 'capital_recovery_fee' => 1, 'profit' => 4],
                'tiers' => [[1, 11, 25], [12, 49, 22], [50, null, 18]],
            ],
            [
                'name' => 'Embroidery Application',
                'category' => 'Embroidery',
                'unit' => 'Pieces',
                'costs' => ['workmanship_cost' => 20, 'machine_maintenance_cost' => 5, 'process_cost' => 3, 'capital_recovery_fee' => 2, 'profit' => 5],
                'tiers' => [[1, 11, 35], [12, 49, 30], [50, null, 25]],
            ],
            [
                'name' => 'DTF Heat Press Application',
                'category' => 'Printing',
                'unit' => 'Pieces',
                'costs' => ['workmanship_cost' => 8, 'machine_maintenance_cost' => 4, 'process_cost' => 2, 'capital_recovery_fee' => 1, 'profit' => 3],
                'tiers' => [[1, 24, 18], [25, 99, 15], [100, null, 12]],
            ],
            [
                'name' => 'Screen Print Application',
                'category' => 'Printing',
                'unit' => 'Pieces',
                'costs' => ['workmanship_cost' => 6, 'machine_maintenance_cost' => 2, 'process_cost' => 1, 'capital_recovery_fee' => 1, 'profit' => 2],
                'tiers' => [[1, 24, 12], [25, 99, 10], [100, null, 8]],
            ],
            [
                'name' => 'Quality Finishing & Packaging',
                'category' => 'Packaging',
                'unit' => 'Pieces',
                'costs' => ['workmanship_cost' => 4, 'machine_maintenance_cost' => 1, 'process_cost' => 1, 'capital_recovery_fee' => 0.5, 'profit' => 1.5],
                'tiers' => [[1, 49, 8], [50, null, 6]],
            ],
        ];

        $serviceModels = [];
        foreach ($services as $s) {
            $category = ProductCategory::firstOrCreate(['name' => $s['category']]);
            $service = Service::firstOrCreate(
                ['name' => $s['name']],
                array_merge(['category_id' => $category->id, 'unit' => $s['unit'], 'is_active' => true], $s['costs'])
            );
            foreach ($s['tiers'] as [$min, $max, $price]) {
                $service->prices()->firstOrCreate(['min_qty' => $min, 'max_qty' => $max], ['unit_price' => $price]);
            }
            $serviceModels[$s['name']] = $service;
        }

        $products = [
            [
                'name' => 'Classic Kente Shirt',
                'category' => 'Apparel',
                'unit' => 'Pieces',
                'components' => [
                    ['material' => 'MAT-00001', 'qty' => 2, 'unit_price' => 45],
                    ['material' => 'MAT-00004', 'qty' => 0.5, 'unit_price' => 12],
                    ['material' => 'MAT-00013', 'qty' => 1, 'unit_price' => 6],
                    ['material' => 'MAT-00017', 'qty' => 1, 'unit_price' => 8],
                    ['service' => 'Garment Cutting & Sewing', 'qty' => 1],
                    ['service' => 'Quality Finishing & Packaging', 'qty' => 1],
                ],
                'tiers' => [[1, 11, 180], [12, 49, 165], [50, null, 150]],
            ],
            [
                'name' => 'Corporate Polo Shirt - Navy',
                'category' => 'Apparel',
                'unit' => 'Pieces',
                'components' => [
                    ['material' => 'MAT-00007', 'qty' => 1.5, 'unit_price' => 22],
                    ['material' => 'MAT-00013', 'qty' => 1, 'unit_price' => 6],
                    ['material' => 'MAT-00026', 'qty' => 1, 'unit_price' => 15],
                    ['service' => 'Embroidery Application', 'qty' => 1],
                    ['service' => 'Garment Cutting & Sewing', 'qty' => 1],
                ],
                'tiers' => [[1, 11, 95], [12, 49, 85], [50, null, 75]],
            ],
            [
                'name' => 'Embroidered Baseball Cap',
                'category' => 'Accessories',
                'unit' => 'Pieces',
                'components' => [
                    ['material' => 'MAT-00005', 'qty' => 0.3, 'unit_price' => 12],
                    ['material' => 'MAT-00025', 'qty' => 1, 'unit_price' => 20],
                    ['service' => 'Embroidery Application', 'qty' => 1],
                ],
                'tiers' => [[1, 23, 45], [24, 99, 40], [100, null, 35]],
            ],
            [
                'name' => 'Custom DTF T-Shirt - White',
                'category' => 'Apparel',
                'unit' => 'Pieces',
                'components' => [
                    ['material' => 'MAT-00004', 'qty' => 1, 'unit_price' => 12],
                    ['material' => 'MAT-00028', 'qty' => 1, 'unit_price' => 10],
                    ['service' => 'DTF Heat Press Application', 'qty' => 1],
                    ['service' => 'Garment Cutting & Sewing', 'qty' => 1],
                ],
                'tiers' => [[1, 24, 65], [25, 99, 58], [100, null, 50]],
            ],
            [
                'name' => 'Custom Screen Print T-Shirt',
                'category' => 'Apparel',
                'unit' => 'Pieces',
                'components' => [
                    ['material' => 'MAT-00005', 'qty' => 1, 'unit_price' => 12],
                    ['material' => 'MAT-00027', 'qty' => 2, 'unit_price' => 5],
                    ['service' => 'Screen Print Application', 'qty' => 2],
                    ['service' => 'Garment Cutting & Sewing', 'qty' => 1],
                ],
                'tiers' => [[1, 24, 60], [25, 99, 52], [100, null, 45]],
            ],
            [
                'name' => 'Canvas Tote Bag - Branded',
                'category' => 'Accessories',
                'unit' => 'Pieces',
                'components' => [
                    ['material' => 'MAT-00009', 'qty' => 0.8, 'unit_price' => 18],
                    ['material' => 'MAT-00027', 'qty' => 1, 'unit_price' => 5],
                    ['service' => 'Screen Print Application', 'qty' => 1],
                    ['service' => 'Garment Cutting & Sewing', 'qty' => 1],
                ],
                'tiers' => [[1, 49, 38], [50, null, 32]],
            ],
            [
                'name' => 'Zippered Hoodie - Charcoal',
                'category' => 'Apparel',
                'unit' => 'Pieces',
                'components' => [
                    ['material' => 'MAT-00008', 'qty' => 2.5, 'unit_price' => 24],
                    ['material' => 'MAT-00011', 'qty' => 1, 'unit_price' => 9],
                    ['material' => 'MAT-00017', 'qty' => 1, 'unit_price' => 8],
                    ['service' => 'Garment Cutting & Sewing', 'qty' => 1],
                    ['service' => 'Quality Finishing & Packaging', 'qty' => 1],
                ],
                'tiers' => [[1, 11, 220], [12, 49, 200], [50, null, 180]],
            ],
            [
                'name' => 'Kente Sash - Multi-Color',
                'category' => 'Apparel',
                'unit' => 'Pieces',
                'components' => [
                    ['material' => 'MAT-00002', 'qty' => 1.5, 'unit_price' => 45],
                    ['material' => 'MAT-00018', 'qty' => 1, 'unit_price' => 8],
                    ['service' => 'Garment Cutting & Sewing', 'qty' => 1],
                ],
                'tiers' => [[1, 23, 110], [24, null, 95]],
            ],
            [
                'name' => 'Executive Laptop Bag',
                'category' => 'Accessories',
                'unit' => 'Pieces',
                'components' => [
                    ['material' => 'MAT-00006', 'qty' => 1, 'unit_price' => 14],
                    ['material' => 'MAT-00012', 'qty' => 1, 'unit_price' => 11],
                    ['material' => 'MAT-00020', 'qty' => 0.5, 'unit_price' => 10],
                    ['service' => 'Garment Cutting & Sewing', 'qty' => 1],
                    ['service' => 'Quality Finishing & Packaging', 'qty' => 1],
                ],
                'tiers' => [[1, 11, 150], [12, null, 135]],
            ],
            [
                'name' => 'Branded Drawstring Bag',
                'category' => 'Accessories',
                'unit' => 'Pieces',
                'components' => [
                    ['material' => 'MAT-00009', 'qty' => 0.5, 'unit_price' => 18],
                    ['material' => 'MAT-00027', 'qty' => 1, 'unit_price' => 5],
                    ['service' => 'Screen Print Application', 'qty' => 1],
                ],
                'tiers' => [[1, 49, 22], [50, null, 18]],
            ],
        ];

        foreach ($products as $p) {
            $category = ProductCategory::firstOrCreate(['name' => $p['category']]);
            $product = Product::firstOrCreate(
                ['name' => $p['name']],
                ['category_id' => $category->id, 'type' => 'physical', 'unit' => $p['unit'], 'is_active' => true]
            );

            if ($product->components()->count() > 0) {
                continue;
            }

            foreach ($p['components'] as $c) {
                if (isset($c['material'])) {
                    $material = InventoryProduct::where('code', $c['material'])->first();
                    if (! $material) {
                        continue;
                    }
                    $product->components()->create([
                        'component_type' => InventoryProduct::class,
                        'component_id' => $material->id,
                        'quantity' => $c['qty'],
                        'unit_price' => $c['unit_price'],
                    ]);
                } else {
                    $service = $serviceModels[$c['service']];
                    $product->components()->create([
                        'component_type' => Service::class,
                        'component_id' => $service->id,
                        'quantity' => $c['qty'],
                        'unit_price' => $service->getDefaultPriceAttribute(),
                    ]);
                }
            }

            foreach ($p['tiers'] as [$min, $max, $price]) {
                $product->prices()->firstOrCreate(['min_qty' => $min, 'max_qty' => $max], ['unit_price' => $price]);
            }
        }
    }
}
