<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('name', 'admin')->first();

        if (! $adminRole) {
            $adminRole = Role::create([
                'name' => 'admin',
                'display_name' => 'Administrator',
                'description' => 'Full system access',
            ]);
        }

        $modules = [
            'crm' => ['view_crm', 'manage_clients', 'manage_leads', 'view_reports'],
            'orders' => ['view_orders', 'create_orders', 'edit_orders', 'delete_orders'],
            'products' => ['view_products', 'create_products', 'edit_products', 'delete_products'],
            'inventory' => ['view_inventory', 'manage_suppliers', 'manage_products', 'manage_stock', 'manage_requisitions'],
            'production' => ['view_production', 'manage_jobs', 'view_schedules'],
            'settings' => ['view_settings', 'manage_settings', 'manage_users', 'manage_roles'],
        ];

        $permissionIds = [];
        foreach ($modules as $module => $permissions) {
            foreach ($permissions as $perm) {
                $permission = Permission::updateOrCreate(
                    ['name' => $perm],
                    ['module' => $module, 'description' => ucfirst(str_replace('_', ' ', $perm))]
                );
                $permissionIds[] = $permission->id;
            }
        }

        $adminRole->permissions()->sync($permissionIds);

        $adminUser = User::where('email', 'admin@dps-erp.com')->first();
        if ($adminUser) {
            $adminUser->role_id = $adminRole->id;
            $adminUser->save();
        }
    }
}
