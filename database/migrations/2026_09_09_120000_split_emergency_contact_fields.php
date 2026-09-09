<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $tables = ['employees', 'employee_invites'];

    public function up(): void
    {
        foreach ($this->tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->string('emergency_contact_name')->nullable()->after('emergency_person');
                $table->string('emergency_contact_phone')->nullable()->after('emergency_contact_name');
                $table->string('emergency_contact_relation')->nullable()->after('emergency_contact_phone');
            });

            DB::table($tableName)
                ->whereNotNull('emergency_person')
                ->where('emergency_person', '!=', '')
                ->orderBy('id')
                ->get(['id', 'emergency_person'])
                ->each(function ($row) use ($tableName) {
                    [$name, $phone] = $this->splitEmergencyPerson($row->emergency_person);

                    DB::table($tableName)->where('id', $row->id)->update([
                        'emergency_contact_name' => $name,
                        'emergency_contact_phone' => $phone,
                    ]);
                });

            Schema::table($tableName, function (Blueprint $table) {
                $table->dropColumn('emergency_person');
            });
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->string('emergency_person')->nullable();
            });

            DB::table($tableName)
                ->orderBy('id')
                ->get(['id', 'emergency_contact_name', 'emergency_contact_phone'])
                ->each(function ($row) use ($tableName) {
                    $combined = trim(collect([$row->emergency_contact_name, $row->emergency_contact_phone])->filter()->implode(' - '));

                    DB::table($tableName)->where('id', $row->id)->update([
                        'emergency_person' => $combined !== '' ? $combined : null,
                    ]);
                });

            Schema::table($tableName, function (Blueprint $table) {
                $table->dropColumn(['emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation']);
            });
        }
    }

    /**
     * Existing data was free text, either "Name (Phone)" (what the seeder used) or "Name - Phone"
     * (the form's placeholder hint) -- neither was enforced, so this split is best-effort. A row
     * that matches neither shape is kept whole in the name field so nothing is silently dropped.
     */
    private function splitEmergencyPerson(string $value): array
    {
        $value = trim($value);

        if (preg_match('/^(.*?)\s*\(([\d+\s-]{6,})\)\s*$/', $value, $matches)) {
            return [trim($matches[1]) ?: null, trim($matches[2]) ?: null];
        }

        if (preg_match('/^(.*?)\s*-\s*([\d+()\s-]{6,})$/', $value, $matches)) {
            return [trim($matches[1]) ?: null, trim($matches[2]) ?: null];
        }

        return [$value ?: null, null];
    }
};
