<?php

use App\Models\Setting;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Str;

return new class extends Migration
{
    // Requested list. Entries whose base name (ignoring a trailing "(abbr)")
    // case-insensitively matches an already-existing UOM are skipped, so
    // e.g. "Feet (ft)" is left out because "Feet" already exists, but
    // "Pounds (lb)" is added even though "Lbs" already covers the same unit
    // -- they're different words, and disambiguating that is a judgment
    // call better left to whoever manages the list in Settings.
    private const REQUESTED = [
        'Pieces', 'Units', 'Dozen', 'Pack', 'Box', 'Roll', 'Sheet', 'Ream', 'Set',
        'Feet (ft)', 'Inches (in)', 'Meters (m)', 'Centimeters (cm)', 'Millimeters (mm)', 'Yards (yd)',
        'Square Millimeters (mm²)', 'Square Inches (in²)', 'Square Feet (ft²)',
        'Square Centimeters (cm²)', 'Square Meters (m²)', 'Square Yards (yd²)',
        'Pounds (lb)', 'Ounces (oz)', 'Kilograms (kg)', 'Grams (g)',
        'Milliliters (ml)', 'Liters (L)', 'Gallons (gal)',
    ];

    // UOM values present before this migration was written (Boxes, Feet,
    // Gallons, Inches, Kg, Lbs, Liters, Meters, Pieces, Rolls, Sheets,
    // Yards). Fixed at authoring time rather than queried live, so up()
    // and down() always agree on the same "what did this migration add"
    // set -- a live query would see its own inserts on a later run and
    // make down() a no-op, or (worse) let a since-added UOM silently
    // swallow a REQUESTED entry it was never meant to dedupe against.
    private const BASELINE = [
        'Boxes', 'Feet', 'Gallons', 'Inches', 'Kg', 'Lbs',
        'Liters', 'Meters', 'Pieces', 'Rolls', 'Sheets', 'Yards',
    ];

    private function baseName(string $value): string
    {
        return strtolower(trim(preg_replace('/\s*\([^)]*\)\s*$/', '', $value)));
    }

    /**
     * The REQUESTED values that aren't already covered by BASELINE.
     * Deterministic regardless of when up()/down() actually run.
     */
    private function toAdd(): array
    {
        $baseline = array_map(fn ($value) => $this->baseName($value), self::BASELINE);
        $toAdd = [];

        foreach (self::REQUESTED as $value) {
            $base = $this->baseName($value);

            if (in_array($base, $baseline, true)) {
                continue;
            }

            $baseline[] = $base;
            $toAdd[] = $value;
        }

        return $toAdd;
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        foreach ($this->toAdd() as $value) {
            $key = 'uom_'.Str::slug($value);

            if (! Setting::where('key', $key)->exists()) {
                Setting::create(['key' => $key, 'value' => $value, 'type' => 'string']);
            }
        }
    }

    /**
     * Reverse the migrations. Only removes rows this migration itself
     * created -- never a pre-existing UOM that happens to share a key
     * slug with a skipped REQUESTED entry (e.g. "Pieces").
     */
    public function down(): void
    {
        $keys = collect($this->toAdd())->map(fn ($value) => 'uom_'.Str::slug($value));

        Setting::whereIn('key', $keys)->delete();
    }
};
