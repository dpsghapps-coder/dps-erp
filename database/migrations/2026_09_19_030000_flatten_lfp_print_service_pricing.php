<?php

use App\Models\Service;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    // Authoritative flat per-sqft rates from the original spreadsheet
    // calculator, replacing the volume-tiered pricing these services had
    // (which didn't match the source tool's numbers).
    private const RATES = [
        'LFP - SAV' => 2.5,
        'LFP - FLEXY' => 2.7,
        'LFP - ONE WAY VISION' => 7.0,
        'LFP - TRANSPARENT' => 2.5,
        'LFP - PRINTABLE VINYL' => 4.0,
        'LFP - REFLECTIVE' => 8.0,
        'SAV PRINT & CUT' => 4.0,
    ];

    // Previous tiered pricing, recorded here (rather than queried live) so
    // down() can restore it regardless of what up() has since changed.
    private const PREVIOUS_TIERS = [
        'LFP - SAV' => [[1, 5, 25], [6, 20, 22], [21, 50, 20], [51, null, 18]],
        'LFP - FLEXY' => [[1, 5, 28], [6, 20, 25], [21, 50, 23], [51, null, 20]],
        'LFP - TRANSPARENT' => [[1, 5, 30], [6, 20, 27], [21, 50, 25], [51, null, 22]],
        'LFP - REFLECTIVE' => [[1, 5, 35], [6, 20, 32], [21, 50, 30], [51, null, 28]],
        'SAV PRINT & CUT' => [[1, 5, 30], [6, 20, 27], [21, 50, 25], [51, null, 23]],
        'LFP - ONE WAY VISION' => [[1, null, 75.35]],
        'LFP - PRINTABLE VINYL' => [[1, null, 43.06]],
    ];

    private function applyTiers(array $tiers): void
    {
        foreach ($tiers as $name => $rows) {
            $service = Service::where('name', $name)->first();

            if (! $service) {
                continue;
            }

            $service->prices()->delete();

            foreach ($rows as [$minQty, $maxQty, $unitPrice]) {
                $service->prices()->create([
                    'min_qty' => $minQty,
                    'max_qty' => $maxQty,
                    'unit_price' => $unitPrice,
                ]);
            }
        }
    }

    public function up(): void
    {
        $this->applyTiers(collect(self::RATES)->mapWithKeys(
            fn ($rate, $name) => [$name => [[1, null, $rate]]]
        )->all());

        foreach (['LFP - ONE WAY VISION', 'LFP - PRINTABLE VINYL'] as $name) {
            $service = Service::where('name', $name)->first();

            if ($service) {
                DB::table('service_cost_items')
                    ->where('service_id', $service->id)
                    ->update(['amount' => self::RATES[$name], 'label' => 'Material cost per sqft']);
            }
        }
    }

    public function down(): void
    {
        $this->applyTiers(self::PREVIOUS_TIERS);

        foreach (['LFP - ONE WAY VISION' => 75.35, 'LFP - PRINTABLE VINYL' => 43.06] as $name => $rate) {
            $service = Service::where('name', $name)->first();

            if ($service) {
                DB::table('service_cost_items')
                    ->where('service_id', $service->id)
                    ->update(['amount' => $rate, 'label' => 'Material cost per sqm']);
            }
        }
    }
};
