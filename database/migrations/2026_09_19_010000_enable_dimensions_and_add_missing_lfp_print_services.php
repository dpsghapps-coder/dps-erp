<?php

use App\Models\ProductCategory;
use App\Models\Service;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    // Existing large-format-print services that are already priced per sqm
    // with volume tiers, but were never flagged as dimension-based -- so the
    // Orders form's Length x Breadth calculator never showed up for them.
    private const EXISTING_TO_ENABLE = [
        'LFP - SAV', 'LFP - FLEXY', 'LFP - TRANSPARENT', 'LFP - REFLECTIVE', 'SAV PRINT & CUT',
    ];

    // Materials with no service at all yet. Rates are the flat per-sqft
    // costs from the old spreadsheet calculator, converted to per-sqm
    // (1 sqft = 0.09290304 sqm) since every other LFP service here prices
    // per sqm. Unlike the five above, these have no volume-tier pricing --
    // that discount structure was built manually for the others and isn't
    // something to invent here.
    private const NEW_SERVICES = [
        'LFP - ONE WAY VISION' => 75.35,
        'LFP - PRINTABLE VINYL' => 43.06,
    ];

    public function up(): void
    {
        Service::whereIn('name', self::EXISTING_TO_ENABLE)->update(['requires_dimensions' => true]);

        $categoryId = ProductCategory::where('name', 'Printing')->value('id');

        foreach (self::NEW_SERVICES as $name => $ratePerSqm) {
            if (Service::where('name', $name)->exists()) {
                continue;
            }

            $service = Service::create([
                'name' => $name,
                'category_id' => $categoryId,
                'unit' => 'sqm',
                'requires_dimensions' => true,
                'is_active' => true,
            ]);

            $service->costItems()->create([
                'label' => 'Material cost per sqm',
                'amount' => $ratePerSqm,
            ]);

            $service->prices()->create([
                'min_qty' => 1,
                'max_qty' => null,
                'unit_price' => $ratePerSqm,
            ]);
        }
    }

    public function down(): void
    {
        Service::whereIn('name', self::EXISTING_TO_ENABLE)->update(['requires_dimensions' => false]);

        $names = array_keys(self::NEW_SERVICES);
        $ids = Service::whereIn('name', $names)->pluck('id');

        DB::table('service_prices')->whereIn('service_id', $ids)->delete();
        DB::table('service_cost_items')->whereIn('service_id', $ids)->delete();
        Service::whereIn('name', $names)->forceDelete();
    }
};
