<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->boolean('is_greylisted')->default(false)->after('first_converted_at');
            $table->dateTime('greylisted_at')->nullable()->after('is_greylisted');
            $table->foreignId('greylisted_by')->nullable()->after('greylisted_at')->constrained('users')->nullOnDelete();
            $table->string('greylist_reason')->nullable()->after('greylisted_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropConstrainedForeignId('greylisted_by');
            $table->dropColumn(['is_greylisted', 'greylisted_at', 'greylist_reason']);
        });
    }
};
