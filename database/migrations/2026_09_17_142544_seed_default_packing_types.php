<?php

use App\Models\Setting;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Str;

return new class extends Migration
{
    private const PACK_TYPES = [
        'Rolls', 'Bag', 'Bucket', 'Bundle', 'Box', 'Case',
        'Carton', 'Pack', 'Pack 50', 'Pack 100', 'Roll', 'Tube',
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        foreach (self::PACK_TYPES as $value) {
            $key = 'pack_type_'.Str::slug($value);

            if (! Setting::where('key', $key)->exists()) {
                Setting::create(['key' => $key, 'value' => $value, 'type' => 'string']);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Setting::where('key', 'like', 'pack_type_%')->delete();
    }
};
