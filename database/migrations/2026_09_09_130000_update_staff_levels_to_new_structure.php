<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Moves the staff-level ladder from the seeded (Junior, Mid-Level, Senior, Lead,
     * Manager, Director, Executive) set to the company's actual set (Intern, Junior,
     * Officer, Senior, Supervisor, Manager, General Manager, Managing Director).
     *
     * Renames existing rows in place rather than delete+recreate, so every employee's
     * staff_level_id and every level's existing leave-type day allowances (Annual/Sick/
     * Casual/Emergency) carry over untouched -- Mid-Level's people and leave allowances
     * become Officer's, Lead's become Supervisor's, Director's become General Manager's,
     * Executive's become Managing Director's. Junior, Senior, and Manager are unchanged.
     * Manager, General Manager, and Managing Director are marked is_manager so those
     * employees are selectable as a Supervising Manager.
     */
    public function up(): void
    {
        $renames = [
            'Junior' => ['name' => 'Junior', 'sort_order' => 2, 'is_manager' => false],
            'Mid-Level' => ['name' => 'Officer', 'sort_order' => 3, 'is_manager' => false],
            'Senior' => ['name' => 'Senior', 'sort_order' => 4, 'is_manager' => false],
            'Lead' => ['name' => 'Supervisor', 'sort_order' => 5, 'is_manager' => false],
            'Manager' => ['name' => 'Manager', 'sort_order' => 6, 'is_manager' => true],
            'Director' => ['name' => 'General Manager', 'sort_order' => 7, 'is_manager' => true],
            'Executive' => ['name' => 'Managing Director', 'sort_order' => 8, 'is_manager' => true],
        ];

        foreach ($renames as $oldName => $attrs) {
            DB::table('staff_levels')->where('name', $oldName)->update([
                'name' => $attrs['name'],
                'sort_order' => $attrs['sort_order'],
                'is_manager' => $attrs['is_manager'],
                'updated_at' => now(),
            ]);
        }

        $internId = DB::table('staff_levels')->where('name', 'Intern')->value('id');

        if (! $internId) {
            $internId = DB::table('staff_levels')->insertGetId([
                'name' => 'Intern',
                'sort_order' => 1,
                'is_manager' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Give Intern a modest leave-day matrix, below Junior's -- HR can adjust in
        // Settings > Leave Types if these defaults don't match the actual policy.
        $internLeaveTypes = [
            'Annual' => 10,
            'Sick' => 5,
            'Casual' => 3,
            'Emergency' => 2,
        ];

        foreach ($internLeaveTypes as $name => $days) {
            DB::table('leave_types')->updateOrInsert(
                ['staff_level_id' => $internId, 'name' => $name],
                ['days_per_year' => $days, 'updated_at' => now(), 'created_at' => now()]
            );
        }
    }

    public function down(): void
    {
        $renames = [
            'Junior' => 'Junior',
            'Officer' => 'Mid-Level',
            'Senior' => 'Senior',
            'Supervisor' => 'Lead',
            'Manager' => 'Manager',
            'General Manager' => 'Director',
            'Managing Director' => 'Executive',
        ];

        foreach ($renames as $currentName => $oldName) {
            DB::table('staff_levels')->where('name', $currentName)->update([
                'name' => $oldName,
                'is_manager' => false,
                'updated_at' => now(),
            ]);
        }

        $internId = DB::table('staff_levels')->where('name', 'Intern')->value('id');

        if ($internId) {
            DB::table('leave_types')->where('staff_level_id', $internId)->delete();
            DB::table('staff_levels')->where('id', $internId)->delete();
        }

        $sortOrders = ['Junior' => 1, 'Mid-Level' => 2, 'Senior' => 3, 'Lead' => 4, 'Manager' => 5, 'Director' => 6, 'Executive' => 7];

        foreach ($sortOrders as $name => $sortOrder) {
            DB::table('staff_levels')->where('name', $name)->update(['sort_order' => $sortOrder]);
        }
    }
};
