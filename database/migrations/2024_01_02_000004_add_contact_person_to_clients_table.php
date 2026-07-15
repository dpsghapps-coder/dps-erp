<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->string('contact_person_1', 100)->nullable()->after('phone');
            $table->string('contact_person_mobile', 10)->nullable()->after('contact_person_1');
        });
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn(['contact_person_1', 'contact_person_mobile']);
        });
    }
};
