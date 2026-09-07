<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * The seeded "public" holidays were US ones (MLK Day, Presidents' Day, etc.) —
     * wrong for a Ghana-based company. Replace them with Ghana's official public
     * holidays. Company-specific holidays (Foundation Day, Anniversary, etc.) are
     * untouched. Eid al-Fitr / Eid al-Adha dates are moon-sighting dependent and
     * given as estimates for 2026, so they're not marked recurring.
     */
    public function up(): void
    {
        $wrongUsHolidays = [
            "Martin Luther King Jr. Day",
            "Presidents' Day",
            'Memorial Day',
            'Independence Day', // was July 4 (US) — replaced with Ghana's March 6 date below
            'Labor Day', // US date — Ghana's equivalent is May Day (May 1)
            'Columbus Day',
            'Veterans Day',
            'Thanksgiving',
        ];

        DB::table('holidays')->where('type', 'public')->whereIn('name', $wrongUsHolidays)->delete();

        $ghanaHolidays = [
            ['name' => "New Year's Day", 'date' => '2026-01-01', 'is_recurring' => true, 'description' => null],
            ['name' => 'Constitution Day', 'date' => '2026-01-07', 'is_recurring' => true, 'description' => null],
            ['name' => 'Independence Day', 'date' => '2026-03-06', 'is_recurring' => true, 'description' => null],
            ['name' => 'Eid al-Fitr', 'date' => '2026-03-20', 'is_recurring' => false, 'description' => 'Date is approximate, subject to moon sighting'],
            ['name' => 'Good Friday', 'date' => '2026-04-03', 'is_recurring' => false, 'description' => null],
            ['name' => 'Easter Monday', 'date' => '2026-04-06', 'is_recurring' => false, 'description' => null],
            ['name' => 'May Day (Workers\' Day)', 'date' => '2026-05-01', 'is_recurring' => true, 'description' => null],
            ['name' => 'Eid al-Adha', 'date' => '2026-05-27', 'is_recurring' => false, 'description' => 'Date is approximate, subject to moon sighting'],
            ['name' => 'African Union Day', 'date' => '2026-05-25', 'is_recurring' => true, 'description' => null],
            ['name' => "Founders' Day", 'date' => '2026-08-04', 'is_recurring' => true, 'description' => null],
            ['name' => 'Kwame Nkrumah Memorial Day', 'date' => '2026-09-21', 'is_recurring' => true, 'description' => null],
            ['name' => "Farmers' Day", 'date' => '2026-12-04', 'is_recurring' => false, 'description' => 'First Friday of December — date shifts each year'],
            ['name' => 'Christmas Day', 'date' => '2026-12-25', 'is_recurring' => true, 'description' => null],
            ['name' => 'Boxing Day', 'date' => '2026-12-26', 'is_recurring' => true, 'description' => null],
        ];

        foreach ($ghanaHolidays as $holiday) {
            DB::table('holidays')->updateOrInsert(
                ['name' => $holiday['name'], 'type' => 'public'],
                [
                    'date' => $holiday['date'],
                    'type' => 'public',
                    'description' => $holiday['description'],
                    'is_recurring' => $holiday['is_recurring'],
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }

        // The old seed also mislabeled "Christmas" — updateOrInsert above created
        // "Christmas Day" fresh; drop the stale "Christmas" row if it still exists.
        DB::table('holidays')->where('type', 'public')->where('name', 'Christmas')->delete();
    }

    public function down(): void
    {
        // Data correction; not reversible to the previous (incorrect) US holiday set.
    }
};
