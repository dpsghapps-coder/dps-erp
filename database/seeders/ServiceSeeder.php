<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            [
                'code' => 'LFP-SAV',
                'name' => 'LFP - SAV',
                'category' => 'Printing',
                'description' => 'Large Format Printing on SAV (Self-Adhesive Vinyl)',
                'unit' => 'sqm',
                'prices' => [
                    ['min_qty' => 1, 'max_qty' => 5, 'unit_price' => 25.00],
                    ['min_qty' => 6, 'max_qty' => 20, 'unit_price' => 22.00],
                    ['min_qty' => 21, 'max_qty' => 50, 'unit_price' => 20.00],
                    ['min_qty' => 51, 'max_qty' => null, 'unit_price' => 18.00],
                ],
            ],
            [
                'code' => 'LFP-FLEXY',
                'name' => 'LFP - FLEXY',
                'category' => 'Printing',
                'description' => 'Large Format Printing on Flexible Banner Material',
                'unit' => 'sqm',
                'prices' => [
                    ['min_qty' => 1, 'max_qty' => 5, 'unit_price' => 28.00],
                    ['min_qty' => 6, 'max_qty' => 20, 'unit_price' => 25.00],
                    ['min_qty' => 21, 'max_qty' => 50, 'unit_price' => 23.00],
                    ['min_qty' => 51, 'max_qty' => null, 'unit_price' => 20.00],
                ],
            ],
            [
                'code' => 'LFP-TRANSPARENT',
                'name' => 'LFP - TRANSPARENT',
                'category' => 'Printing',
                'description' => 'Large Format Printing on Transparent Material',
                'unit' => 'sqm',
                'prices' => [
                    ['min_qty' => 1, 'max_qty' => 5, 'unit_price' => 30.00],
                    ['min_qty' => 6, 'max_qty' => 20, 'unit_price' => 27.00],
                    ['min_qty' => 21, 'max_qty' => 50, 'unit_price' => 25.00],
                    ['min_qty' => 51, 'max_qty' => null, 'unit_price' => 22.00],
                ],
            ],
            [
                'code' => 'LFP-REFLECTIVE',
                'name' => 'LFP - REFLECTIVE',
                'category' => 'Printing',
                'description' => 'Large Format Printing on Reflective Material',
                'unit' => 'sqm',
                'prices' => [
                    ['min_qty' => 1, 'max_qty' => 5, 'unit_price' => 35.00],
                    ['min_qty' => 6, 'max_qty' => 20, 'unit_price' => 32.00],
                    ['min_qty' => 21, 'max_qty' => 50, 'unit_price' => 30.00],
                    ['min_qty' => 51, 'max_qty' => null, 'unit_price' => 28.00],
                ],
            ],
            [
                'code' => 'SUBLIMATION-A4',
                'name' => 'SUBLIMATION (A4)',
                'category' => 'Printing',
                'description' => 'Sublimation Printing on A4 Paper',
                'unit' => 'pcs',
                'prices' => [
                    ['min_qty' => 1, 'max_qty' => 10, 'unit_price' => 8.00],
                    ['min_qty' => 11, 'max_qty' => 50, 'unit_price' => 6.00],
                    ['min_qty' => 51, 'max_qty' => 100, 'unit_price' => 5.00],
                    ['min_qty' => 101, 'max_qty' => null, 'unit_price' => 4.00],
                ],
            ],
            [
                'code' => 'SAV-PRINT-CUT',
                'name' => 'SAV PRINT & CUT',
                'category' => 'Finishing',
                'description' => 'Print and Cut service for Self-Adhesive Vinyl',
                'unit' => 'sqm',
                'prices' => [
                    ['min_qty' => 1, 'max_qty' => 5, 'unit_price' => 30.00],
                    ['min_qty' => 6, 'max_qty' => 20, 'unit_price' => 27.00],
                    ['min_qty' => 21, 'max_qty' => 50, 'unit_price' => 25.00],
                    ['min_qty' => 51, 'max_qty' => null, 'unit_price' => 23.00],
                ],
            ],
            [
                'code' => 'MUG-PRESSING',
                'name' => 'MUG PRESSING',
                'category' => 'Press',
                'description' => 'Mug Pressing service for custom mug prints',
                'unit' => 'pcs',
                'prices' => [
                    ['min_qty' => 1, 'max_qty' => 10, 'unit_price' => 12.00],
                    ['min_qty' => 11, 'max_qty' => 50, 'unit_price' => 10.00],
                    ['min_qty' => 51, 'max_qty' => 100, 'unit_price' => 9.00],
                    ['min_qty' => 101, 'max_qty' => null, 'unit_price' => 8.00],
                ],
            ],
            [
                'code' => 'DESIGN-BROCHURE',
                'name' => 'DESIGN - BROCHURE',
                'category' => 'Design',
                'description' => 'Brochure Design Service',
                'unit' => 'hr',
                'prices' => [
                    ['min_qty' => 1, 'max_qty' => 1, 'unit_price' => 50.00],
                    ['min_qty' => 2, 'max_qty' => 5, 'unit_price' => 45.00],
                    ['min_qty' => 6, 'max_qty' => 10, 'unit_price' => 40.00],
                    ['min_qty' => 11, 'max_qty' => null, 'unit_price' => 35.00],
                ],
            ],
            [
                'code' => 'DESIGN-CARD',
                'name' => 'DESIGN - COMPLEMENTARY CARD',
                'category' => 'Design',
                'description' => 'Complementary Card Design Service',
                'unit' => 'hr',
                'prices' => [
                    ['min_qty' => 1, 'max_qty' => 1, 'unit_price' => 35.00],
                    ['min_qty' => 2, 'max_qty' => 5, 'unit_price' => 30.00],
                    ['min_qty' => 6, 'max_qty' => 10, 'unit_price' => 28.00],
                    ['min_qty' => 11, 'max_qty' => null, 'unit_price' => 25.00],
                ],
            ],
            [
                'code' => 'DESIGN-FLYER',
                'name' => 'DESIGN - FLYER',
                'category' => 'Design',
                'description' => 'Flyer Design Service',
                'unit' => 'hr',
                'prices' => [
                    ['min_qty' => 1, 'max_qty' => 1, 'unit_price' => 40.00],
                    ['min_qty' => 2, 'max_qty' => 5, 'unit_price' => 35.00],
                    ['min_qty' => 6, 'max_qty' => 10, 'unit_price' => 32.00],
                    ['min_qty' => 11, 'max_qty' => null, 'unit_price' => 30.00],
                ],
            ],
            [
                'code' => 'DESIGN-LOGO',
                'name' => 'DESIGN - LOGO',
                'category' => 'Design',
                'description' => 'Logo Design Service',
                'unit' => 'hr',
                'prices' => [
                    ['min_qty' => 1, 'max_qty' => 1, 'unit_price' => 75.00],
                    ['min_qty' => 2, 'max_qty' => 3, 'unit_price' => 65.00],
                    ['min_qty' => 4, 'max_qty' => 5, 'unit_price' => 55.00],
                    ['min_qty' => 6, 'max_qty' => null, 'unit_price' => 50.00],
                ],
            ],
        ];

        foreach ($services as $serviceData) {
            $prices = $serviceData['prices'];
            unset($serviceData['prices']);

            $service = Service::create($serviceData);

            foreach ($prices as $price) {
                $service->prices()->create($price);
            }
        }
    }
}
