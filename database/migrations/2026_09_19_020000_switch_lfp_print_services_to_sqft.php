<?php

use App\Models\Service;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    private const MATERIAL_NAMES = [
        'LFP - SAV', 'LFP - FLEXY', 'LFP - TRANSPARENT', 'LFP - REFLECTIVE', 'SAV PRINT & CUT',
        'LFP - ONE WAY VISION', 'LFP - PRINTABLE VINYL',
    ];

    // These materials' tier breakpoints and rates were priced per sqft in
    // spirit from the start (small/medium/large sign-size ranges) but the
    // Service.unit column was set to sqm without converting anything -- so
    // this is a straight relabel, not a unit-value conversion.
    public function up(): void
    {
        Service::whereIn('name', self::MATERIAL_NAMES)->update(['unit' => 'sqft']);
    }

    public function down(): void
    {
        Service::whereIn('name', self::MATERIAL_NAMES)->update(['unit' => 'sqm']);
    }
};
