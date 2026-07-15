<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('requisitions', function (Blueprint $table) {
            $table->string('purpose', 50)->nullable()->after('qty_requested');
            $table->string('department', 100)->nullable()->after('requested_by');
        });
    }

    public function down()
    {
        Schema::table('requisitions', function (Blueprint $table) {
            $table->dropColumn(['purpose', 'department']);
        });
    }
};
