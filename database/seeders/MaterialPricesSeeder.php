<?php

namespace Database\Seeders;

use App\Models\InventoryProduct;
use App\Models\Supplier;
use App\Models\SupplierBranch;
use App\Models\MaterialSupplierPrice;
use App\Models\MaterialPrice;
use App\Models\User;
use Illuminate\Database\Seeder;

class MaterialPricesSeeder extends Seeder
{
    public function run(): void
    {
        $adminUser = User::where('email', 'admin@dps-erp.com')->first();
        $userId = $adminUser?->id;

        $newSuppliers = [
            ['company_name' => 'Golden Thread Textiles', 'city' => 'Tema', 'country' => 'Ghana', 'payment_terms' => 'Net 30', 'is_active' => true],
            ['company_name' => 'Coastal Fabrics Ltd', 'city' => 'Takoradi', 'country' => 'Ghana', 'payment_terms' => 'Net 30', 'is_active' => true],
            ['company_name' => 'AfriSupply Global', 'city' => 'Lagos', 'country' => 'Nigeria', 'payment_terms' => 'Net 45', 'is_active' => true],
            ['company_name' => 'Zhongshan Zipper Co', 'city' => 'Zhongshan', 'country' => 'China', 'payment_terms' => 'Net 60', 'is_active' => true],
            ['company_name' => 'Max Button Industries', 'city' => 'Accra', 'country' => 'Ghana', 'payment_terms' => 'Net 30', 'is_active' => true],
            ['company_name' => 'Swift Threads Kenya', 'city' => 'Mombasa', 'country' => 'Kenya', 'payment_terms' => 'Net 45', 'is_active' => true],
            ['company_name' => 'Asia Pacific Textiles', 'city' => 'Ho Chi Minh City', 'country' => 'Vietnam', 'payment_terms' => 'Net 60', 'is_active' => true],
            ['company_name' => 'WestStar Buttons', 'city' => 'Cape Coast', 'country' => 'Ghana', 'payment_terms' => 'Net 30', 'is_active' => true],
            ['company_name' => 'Nairobi Thread Works', 'city' => 'Nairobi', 'country' => 'Kenya', 'payment_terms' => 'Net 45', 'is_active' => true],
            ['company_name' => 'Lagos Packaging Hub', 'city' => 'Lagos', 'country' => 'Nigeria', 'payment_terms' => 'Net 30', 'is_active' => true],
            ['company_name' => 'Sika Embroidery Ltd', 'city' => 'Kumasi', 'country' => 'Ghana', 'payment_terms' => 'Net 30', 'is_active' => true],
            ['company_name' => 'Shenzhen QuickZip', 'city' => 'Shenzhen', 'country' => 'China', 'payment_terms' => 'Net 60', 'is_active' => true],
            ['company_name' => 'Abidjan Fabric Trading', 'city' => 'Abidjan', 'country' => 'Ivory Coast', 'payment_terms' => 'Net 45', 'is_active' => true],
            ['company_name' => 'Sunrise Cotton Mills', 'city' => 'Kumasi', 'country' => 'Ghana', 'payment_terms' => 'Net 30', 'is_active' => true],
            ['company_name' => 'Addis Ababa Threads', 'city' => 'Addis Ababa', 'country' => 'Ethiopia', 'payment_terms' => 'Net 45', 'is_active' => true],
        ];

        foreach ($newSuppliers as $sData) {
            $supplier = Supplier::firstOrCreate(
                ['company_name' => $sData['company_name']],
                $sData
            );

            SupplierBranch::firstOrCreate(
                ['supplier_id' => $supplier->id, 'name' => 'Main Office'],
                [
                    'contact_name' => fake()->name(),
                    'mobile' => '0' . fake()->numerify('#########'),
                    'email' => strtolower(str_replace(' ', '', $supplier->company_name)) . '@email.com',
                    'address' => fake()->address(),
                ]
            );
        }

        $allSuppliers = Supplier::orderBy('id')->pluck('id')->toArray();
        $materials = InventoryProduct::orderBy('id')->get();
        $materialCount = $materials->count();
        $supplierCount = count($allSuppliers);

        $basePriceRanges = [
            'Apparel' => [45, 180],
            'Textiles' => [25, 95],
            'Accessories' => [2, 35],
            'Raw Materials' => [15, 65],
            'Packaging' => [1, 12],
            'Embroidery' => [8, 40],
            'Printing' => [3, 18],
            'Footwear' => [5, 25],
        ];

        foreach ($materials as $material) {
            $numSuppliers = fake()->numberBetween(2, min(9, $supplierCount));
            $shuffled = fake()->shuffle($allSuppliers);
            $linkedSuppliers = array_slice($shuffled, 0, $numSuppliers);

            foreach ($linkedSuppliers as $supplierId) {
                MaterialSupplierPrice::firstOrCreate(
                    ['material_id' => $material->id, 'supplier_id' => $supplierId],
                    [
                        'date_created' => fake()->dateTimeBetween('-6 months', 'now'),
                        'created_by' => $userId,
                    ]
                );

                $category = $material->item_category ?? 'Textiles';
                $range = $basePriceRanges[$category] ?? [10, 50];
                $basePrice = fake()->randomFloat(2, $range[0], $range[1]);

                $numPrices = fake()->numberBetween(2, 4);
                $usedDates = [];
                for ($i = 0; $i < $numPrices; $i++) {
                    $variation = $basePrice * fake()->randomFloat(4, -0.15, 0.15);
                    $price = max(0.01, round($basePrice + $variation, 2));

                    do {
                        $date = fake()->dateTimeBetween('-3 months', 'now')->format('Y-m-d');
                    } while (in_array($date, $usedDates));
                    $usedDates[] = $date;

                    MaterialPrice::create([
                        'material_id' => $material->id,
                        'supplier_id' => $supplierId,
                        'price' => $price,
                        'collected_by' => $userId,
                        'collection_date' => $date,
                        'added_by' => $userId,
                    ]);

                    $basePrice = $price;
                }
            }
        }
    }
}
