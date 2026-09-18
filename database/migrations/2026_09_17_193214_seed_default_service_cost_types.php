<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Hardcoded rather than derived from anything live, so up()/down() stay
     * correct no matter what's been added or removed since this ran.
     */
    private const BASELINE = [
        'Workmanship',
        'Machine Maintenance',
        'Process Cost',
        'Capital Investment Recovery Fee',
        'Profit',
    ];

    public function up(): void
    {
        $now = now();

        foreach (self::BASELINE as $value) {
            $key = 'service_cost_'.Str::slug($value);

            if (! DB::table('settings')->where('key', $key)->exists()) {
                DB::table('settings')->insert([
                    'key' => $key,
                    'value' => $value,
                    'type' => 'string',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
    }

    public function down(): void
    {
        foreach (self::BASELINE as $value) {
            DB::table('settings')->where('key', 'service_cost_'.Str::slug($value))->delete();
        }
    }
};
