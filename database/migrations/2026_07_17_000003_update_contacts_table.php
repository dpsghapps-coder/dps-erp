<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->string('branch')->nullable()->after('client_id');
            $table->string('location')->nullable()->after('branch');
            $table->dropColumn(['email', 'is_primary']);
        });
    }

    public function down(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->string('email')->nullable()->after('phone');
            $table->boolean('is_primary')->default(false)->after('email');
            $table->dropColumn(['branch', 'location']);
        });
    }
};
