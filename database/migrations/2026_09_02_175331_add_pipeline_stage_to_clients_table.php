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
        Schema::table('clients', function (Blueprint $table) {
            $table->string('pipeline_stage')->nullable()->after('status');
            $table->string('lost_reason')->nullable()->after('pipeline_stage');
            $table->text('lost_note')->nullable()->after('lost_reason');
        });

        DB::table('clients')->where('status', 'active')->update(['pipeline_stage' => 'converted']);
        DB::table('clients')->where('status', 'inactive')->update(['pipeline_stage' => 'lost']);
        DB::table('clients')->where('status', 'lead')->update(['pipeline_stage' => 'new_lead']);
        DB::table('clients')->where('status', 'prospect')->update(['pipeline_stage' => 'negotiating']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn(['pipeline_stage', 'lost_reason', 'lost_note']);
        });
    }
};
