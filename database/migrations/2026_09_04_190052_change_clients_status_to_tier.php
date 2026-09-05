<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Reset existing lifecycle values to the new default tier before changing the enum,
        // since lead/prospect/active/inactive has no meaningful mapping to a client tier.
        DB::table('clients')->update(['status' => 'bronze']);

        Schema::table('clients', function (Blueprint $table) {
            $table->enum('status', ['bronze', 'silver', 'gold', 'platinum'])->default('bronze')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->enum('status', ['lead', 'prospect', 'active', 'inactive'])->default('lead')->change();
        });

        DB::table('clients')->update(['status' => 'lead']);
    }
};
