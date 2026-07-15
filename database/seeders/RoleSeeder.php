<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $allPermissions = Permission::pluck('id')->toArray();

        $crmPerms = Permission::where('module', 'crm')->pluck('id')->toArray();
        $productsPerms = Permission::where('module', 'products')->pluck('id')->toArray();
        $servicesPerms = Permission::where('module', 'services')->pluck('id')->toArray();
        $inventoryPerms = Permission::where('module', 'inventory')->pluck('id')->toArray();
        $ordersPerms = Permission::where('module', 'orders')->pluck('id')->toArray();
        $productionPerms = Permission::where('module', 'production')->pluck('id')->toArray();
        $procurementPerms = Permission::where('module', 'procurement')->pluck('id')->toArray();
        $hrmPerms = Permission::where('module', 'hrm')->pluck('id')->toArray();
        $financePerms = Permission::where('module', 'finance')->pluck('id')->toArray();
        $studioPerms = Permission::where('module', 'studio')->pluck('id')->toArray();
        $adminPerms = Permission::where('module', 'admin')->pluck('id')->toArray();

        $roles = [
            [
                'name' => 'md',
                'display_name' => 'Managing Director',
                'description' => 'Full access to all modules',
                'permissions' => $allPermissions,
            ],
            [
                'name' => 'general',
                'display_name' => 'General',
                'description' => 'Basic view-only access across modules',
                'permissions' => array_merge(
                    $crmPerms,
                    $ordersPerms,
                    $productionPerms,
                    $hrmPerms,
                    $financePerms,
                ),
            ],
            [
                'name' => 'manager',
                'display_name' => 'Manager',
                'description' => 'Broad operational access across departments',
                'permissions' => array_merge(
                    $crmPerms,
                    $productsPerms,
                    $servicesPerms,
                    $inventoryPerms,
                    $ordersPerms,
                    $productionPerms,
                    $procurementPerms,
                    $hrmPerms,
                    $financePerms,
                    $studioPerms,
                ),
            ],
            [
                'name' => 'supervisor',
                'display_name' => 'Supervisor',
                'description' => 'Team oversight with edit access',
                'permissions' => array_merge(
                    $crmPerms,
                    $inventoryPerms,
                    $ordersPerms,
                    $productionPerms,
                    $procurementPerms,
                    $hrmPerms,
                ),
            ],
            [
                'name' => 'senior_designer',
                'display_name' => 'Senior Designer',
                'description' => 'Full studio and creative access',
                'permissions' => array_merge(
                    $studioPerms,
                    $crmPerms,
                    $productsPerms,
                ),
            ],
            [
                'name' => 'junior_designer',
                'display_name' => 'Junior Designer',
                'description' => 'Limited studio access',
                'permissions' => array_merge(
                    Permission::where('name', 'studio.view')->pluck('id')->toArray(),
                    Permission::where('name', 'studio.manage_bookings')->pluck('id')->toArray(),
                ),
            ],
            [
                'name' => 'senior_artisan',
                'display_name' => 'Senior Artisan',
                'description' => 'Full production and inventory access',
                'permissions' => array_merge(
                    $productionPerms,
                    $inventoryPerms,
                    $procurementPerms,
                ),
            ],
            [
                'name' => 'junior_artisan',
                'display_name' => 'Junior Artisan',
                'description' => 'Limited production access',
                'permissions' => array_merge(
                    Permission::where('name', 'production.view')->pluck('id')->toArray(),
                    Permission::where('name', 'production.create')->pluck('id')->toArray(),
                    Permission::where('name', 'inventory.view')->pluck('id')->toArray(),
                ),
            ],
            [
                'name' => 'intern',
                'display_name' => 'Intern',
                'description' => 'View-only access across modules',
                'permissions' => array_merge(
                    Permission::where('name', 'crm.view')->pluck('id')->toArray(),
                    Permission::where('name', 'products.view')->pluck('id')->toArray(),
                    Permission::where('name', 'inventory.view')->pluck('id')->toArray(),
                    Permission::where('name', 'orders.view')->pluck('id')->toArray(),
                    Permission::where('name', 'production.view')->pluck('id')->toArray(),
                    Permission::where('name', 'studio.view')->pluck('id')->toArray(),
                    Permission::where('name', 'hrm.view')->pluck('id')->toArray(),
                ),
            ],
            [
                'name' => 'senior_customer_service_rep',
                'display_name' => 'Senior Customer Service Rep',
                'description' => 'Full CRM and orders access',
                'permissions' => array_merge(
                    $crmPerms,
                    $ordersPerms,
                ),
            ],
            [
                'name' => 'junior_customer_service_rep',
                'display_name' => 'Junior Customer Service Rep',
                'description' => 'Basic CRM and orders view access',
                'permissions' => array_merge(
                    Permission::where('name', 'crm.view')->pluck('id')->toArray(),
                    Permission::where('name', 'crm.view_clients')->pluck('id')->toArray(),
                    Permission::where('name', 'crm.create_clients')->pluck('id')->toArray(),
                    Permission::where('name', 'orders.view')->pluck('id')->toArray(),
                    Permission::where('name', 'orders.create')->pluck('id')->toArray(),
                ),
            ],
        ];

        foreach ($roles as $roleData) {
            $permissions = $roleData['permissions'];
            unset($roleData['permissions']);

            $role = Role::updateOrCreate(
                ['name' => $roleData['name']],
                $roleData
            );

            $role->permissions()->syncWithoutDetaching($permissions);
        }
    }
}
