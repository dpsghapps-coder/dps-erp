<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // CRM
            ['name' => 'crm.view', 'module' => 'crm', 'description' => 'View CRM module'],
            ['name' => 'crm.view_clients', 'module' => 'crm', 'description' => 'View clients'],
            ['name' => 'crm.create_clients', 'module' => 'crm', 'description' => 'Create clients'],
            ['name' => 'crm.edit_clients', 'module' => 'crm', 'description' => 'Edit clients'],
            ['name' => 'crm.delete_clients', 'module' => 'crm', 'description' => 'Delete clients'],
            ['name' => 'crm.view_leads', 'module' => 'crm', 'description' => 'View leads'],
            ['name' => 'crm.view_reports', 'module' => 'crm', 'description' => 'View CRM reports'],

            // Products
            ['name' => 'products.view', 'module' => 'products', 'description' => 'View products'],
            ['name' => 'products.create', 'module' => 'products', 'description' => 'Create products'],
            ['name' => 'products.edit', 'module' => 'products', 'description' => 'Edit products'],
            ['name' => 'products.delete', 'module' => 'products', 'description' => 'Delete products'],

            // Services
            ['name' => 'services.view', 'module' => 'services', 'description' => 'View services'],
            ['name' => 'services.create', 'module' => 'services', 'description' => 'Create services'],
            ['name' => 'services.edit', 'module' => 'services', 'description' => 'Edit services'],
            ['name' => 'services.delete', 'module' => 'services', 'description' => 'Delete services'],

            // Inventory
            ['name' => 'inventory.view', 'module' => 'inventory', 'description' => 'View inventory'],
            ['name' => 'inventory.manage_suppliers', 'module' => 'inventory', 'description' => 'Manage suppliers'],
            ['name' => 'inventory.manage_products', 'module' => 'inventory', 'description' => 'Manage inventory products'],
            ['name' => 'inventory.manage_stock', 'module' => 'inventory', 'description' => 'Manage stock levels'],
            ['name' => 'inventory.manage_requisitions', 'module' => 'inventory', 'description' => 'Manage requisitions'],

            // Orders
            ['name' => 'orders.view', 'module' => 'orders', 'description' => 'View orders'],
            ['name' => 'orders.create', 'module' => 'orders', 'description' => 'Create orders'],
            ['name' => 'orders.edit', 'module' => 'orders', 'description' => 'Edit orders'],
            ['name' => 'orders.delete', 'module' => 'orders', 'description' => 'Delete orders'],
            ['name' => 'orders.approve', 'module' => 'orders', 'description' => 'Approve/cancel orders'],

            // Production
            ['name' => 'production.view', 'module' => 'production', 'description' => 'View production'],
            ['name' => 'production.create', 'module' => 'production', 'description' => 'Create production jobs'],
            ['name' => 'production.edit', 'module' => 'production', 'description' => 'Edit production jobs'],
            ['name' => 'production.delete', 'module' => 'production', 'description' => 'Delete production jobs'],

            // Procurement
            ['name' => 'procurement.view', 'module' => 'procurement', 'description' => 'View procurement'],
            ['name' => 'procurement.create', 'module' => 'procurement', 'description' => 'Create purchase orders'],
            ['name' => 'procurement.edit', 'module' => 'procurement', 'description' => 'Edit purchase orders'],
            ['name' => 'procurement.delete', 'module' => 'procurement', 'description' => 'Delete purchase orders'],
            ['name' => 'procurement.manage_goods', 'module' => 'procurement', 'description' => 'Manage goods received'],
            ['name' => 'procurement.inspect', 'module' => 'procurement', 'description' => 'Inspect received goods'],
            ['name' => 'procurement.close', 'module' => 'procurement', 'description' => 'Close purchase orders'],

            // Purchase Requests
            ['name' => 'pr.view', 'module' => 'procurement', 'description' => 'View purchase requests'],
            ['name' => 'pr.create', 'module' => 'procurement', 'description' => 'Create purchase requests'],
            ['name' => 'pr.approve', 'module' => 'procurement', 'description' => 'Approve/reject purchase requests (dept manager)'],
            ['name' => 'pr.finance.review', 'module' => 'procurement', 'description' => 'Finance review purchase requests'],
            ['name' => 'pr.cancel', 'module' => 'procurement', 'description' => 'Cancel purchase requests'],

            // HRM
            ['name' => 'hrm.view', 'module' => 'hrm', 'description' => 'View HRM module'],
            ['name' => 'hrm.manage_employees', 'module' => 'hrm', 'description' => 'Manage employees'],
            ['name' => 'hrm.view_payroll', 'module' => 'hrm', 'description' => 'View payroll'],
            ['name' => 'hrm.manage_payroll', 'module' => 'hrm', 'description' => 'Manage payroll'],
            ['name' => 'hrm.manage_attendance', 'module' => 'hrm', 'description' => 'Manage attendance'],
            ['name' => 'hrm.manage_leaves', 'module' => 'hrm', 'description' => 'Manage leaves'],
            ['name' => 'hrm.manage_holidays', 'module' => 'hrm', 'description' => 'Manage holidays'],
            ['name' => 'hrm.manage_performance', 'module' => 'hrm', 'description' => 'Manage performance'],
            ['name' => 'hrm.manage_noticeboard', 'module' => 'hrm', 'description' => 'Manage noticeboard'],
            ['name' => 'hrm.manage_settings', 'module' => 'hrm', 'description' => 'Manage HRM settings'],

            // Finance
            ['name' => 'finance.view', 'module' => 'finance', 'description' => 'View finance'],
            ['name' => 'finance.create', 'module' => 'finance', 'description' => 'Create transactions'],
            ['name' => 'finance.edit', 'module' => 'finance', 'description' => 'Edit transactions'],
            ['name' => 'finance.delete', 'module' => 'finance', 'description' => 'Delete transactions'],

            // Studio
            ['name' => 'studio.view', 'module' => 'studio', 'description' => 'View studio'],
            ['name' => 'studio.manage_bookings', 'module' => 'studio', 'description' => 'Manage bookings'],

            // Admin
            ['name' => 'admin.view_dashboard', 'module' => 'admin', 'description' => 'View admin dashboard'],
            ['name' => 'admin.manage_users', 'module' => 'admin', 'description' => 'Manage users'],
            ['name' => 'admin.manage_roles', 'module' => 'admin', 'description' => 'Manage roles and permissions'],
            ['name' => 'admin.view_audit_logs', 'module' => 'admin', 'description' => 'View audit logs'],
            ['name' => 'admin.manage_settings', 'module' => 'admin', 'description' => 'Manage system settings'],

            // Chat
            ['name' => 'chat.view', 'module' => 'chat', 'description' => 'View and use chat'],
            ['name' => 'chat.create_groups', 'module' => 'chat', 'description' => 'Create group conversations'],
            ['name' => 'chat.manage_groups', 'module' => 'chat', 'description' => 'Manage group members and settings'],

            // Decision Hub
            ['name' => 'decision_hub.view', 'module' => 'decision_hub', 'description' => 'View Decision Hub'],
            ['name' => 'decision_hub.create', 'module' => 'decision_hub', 'description' => 'Create meetings and decisions'],
            ['name' => 'decision_hub.edit', 'module' => 'decision_hub', 'description' => 'Edit decisions'],
            ['name' => 'decision_hub.delete', 'module' => 'decision_hub', 'description' => 'Delete decisions'],
        ];

        foreach ($permissions as $perm) {
            Permission::updateOrCreate(
                ['name' => $perm['name']],
                $perm
            );
        }

        // Ensure admin role gets all permissions
        $adminRole = Role::firstOrCreate(
            ['name' => 'admin'],
            [
                'display_name' => 'System Administrator',
                'description' => 'Full access to all modules and system settings',
            ]
        );

        $allPermissions = Permission::pluck('id')->toArray();
        $adminRole->permissions()->syncWithoutDetaching($allPermissions);
    }
}
