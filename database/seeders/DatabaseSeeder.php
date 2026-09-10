<?php

namespace Database\Seeders;

use App\Models\PriceList;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(PermissionSeeder::class);
        $this->call(RoleSeeder::class);

        $adminRole = Role::where('name', 'admin')->first();

        $user = User::create([
            'name' => 'Admin',
            'email' => 'admin@dps-erp.com',
            'password' => Hash::make('password'),
            'role_id' => $adminRole->id,
            'is_active' => true,
        ]);

        $defaultPriceList = PriceList::create([
            'name' => 'Default Price List',
            'currency' => 'USD',
            'is_default' => true,
        ]);

        $this->call(CrmLookupSeeder::class);
        $this->call(ClientSeeder::class);

        $this->call(InventorySeeder::class);
        $this->call(MaterialPricesSeeder::class);
        $this->call(HrmSeeder::class);
        $this->call(PurchaseRequestSeeder::class);
        $this->call(DecisionHubSeeder::class);

        $this->call(ServiceSeeder::class);
        $this->call(ProductServiceSeeder::class);
        $this->call(OrderSeeder::class);
        $this->call(ProductionSeeder::class);
        $this->call(MarketingSeeder::class);
        $this->call(ChatSeeder::class);
        $this->call(StudioSeeder::class);
        $this->call(ChartOfAccountsSeeder::class);
        $this->call(FinanceSeeder::class);
        $this->call(MiscMockDataSeeder::class);
    }
}
