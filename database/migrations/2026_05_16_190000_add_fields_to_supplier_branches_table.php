<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('supplier_branches', function (Blueprint $table) {
            $table->string('email')->nullable()->after('contact_name');
            $table->text('address')->nullable()->after('mobile');
            $table->string('location')->nullable()->after('address');
        });
    }

    public function down(): void
    {
        Schema::table('supplier_branches', function (Blueprint $table) {
            $table->dropColumn(['email', 'address', 'location']);
        });
    }
};
