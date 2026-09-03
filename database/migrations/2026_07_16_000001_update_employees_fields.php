<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropForeign(['level_id']);
            $table->dropColumn('level_id');
            $table->renameColumn('leave_balance', 'leave_days');
            $table->renameColumn('phone', 'mobile_1');
            $table->renameColumn('emergency_contact', 'emergency_person');
            $table->string('mobile_2')->nullable()->after('mobile_1');
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->foreignId('level_id')->nullable()->constrained('levels')->nullOnDelete();
            $table->renameColumn('leave_days', 'leave_balance');
            $table->renameColumn('mobile_1', 'phone');
            $table->renameColumn('emergency_person', 'emergency_contact');
            $table->dropColumn('mobile_2');
        });
    }
};
