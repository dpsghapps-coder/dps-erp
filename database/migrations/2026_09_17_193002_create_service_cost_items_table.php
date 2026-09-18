<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The 5 fixed cost columns this replaces, mapped to the row label each
     * one becomes. Fixed strings (not Service::COST_FIELDS, which this
     * migration outlives) so up()/down() stay correct regardless of later
     * code changes.
     */
    private const LABELS = [
        'workmanship_cost' => 'Workmanship',
        'machine_maintenance_cost' => 'Machine Maintenance',
        'process_cost' => 'Process Cost',
        'capital_recovery_fee' => 'Capital Investment Recovery Fee',
        'profit' => 'Profit',
    ];

    public function up(): void
    {
        Schema::create('service_cost_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->string('label');
            $table->decimal('amount', 12, 2)->default(0);
            $table->timestamps();
        });

        // Preserve each service's existing cost breakdown as rows before the
        // fixed columns are dropped below.
        DB::table('services')->select(['id', ...array_keys(self::LABELS)])->orderBy('id')->each(function ($service) {
            $now = now();
            $rows = [];

            foreach (self::LABELS as $column => $label) {
                if ((float) $service->{$column} != 0) {
                    $rows[] = [
                        'service_id' => $service->id,
                        'label' => $label,
                        'amount' => $service->{$column},
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }
            }

            if ($rows) {
                DB::table('service_cost_items')->insert($rows);
            }
        });

        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn(array_keys(self::LABELS));
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->decimal('workmanship_cost', 12, 2)->default(0)->after('unit');
            $table->decimal('machine_maintenance_cost', 12, 2)->default(0)->after('workmanship_cost');
            $table->decimal('process_cost', 12, 2)->default(0)->after('machine_maintenance_cost');
            $table->decimal('capital_recovery_fee', 12, 2)->default(0)->after('process_cost');
            $table->decimal('profit', 12, 2)->default(0)->after('capital_recovery_fee');
        });

        $columnsByLabel = array_flip(self::LABELS);

        DB::table('service_cost_items')->orderBy('id')->each(function ($item) use ($columnsByLabel) {
            if (isset($columnsByLabel[$item->label])) {
                DB::table('services')->where('id', $item->service_id)->update([$columnsByLabel[$item->label] => $item->amount]);
            }
        });

        Schema::dropIfExists('service_cost_items');
    }
};
