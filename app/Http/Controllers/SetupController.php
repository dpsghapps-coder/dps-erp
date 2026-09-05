<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\ProductCategory;
use App\Models\Role;
use App\Models\Setting;
use App\Models\User;
use Database\Seeders\ClientSeeder;
use Database\Seeders\DecisionHubSeeder;
use Database\Seeders\HrmSeeder;
use Database\Seeders\InventorySeeder;
use Database\Seeders\MaterialPricesSeeder;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\PurchaseRequestSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\ServiceSeeder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SetupController extends Controller
{
    public function show()
    {
        if (User::count() > 0) {
            return redirect()->route('login');
        }

        return inertia('Setup/Index');
    }

    public function store(Request $request)
    {
        if (User::count() > 0) {
            return redirect()->route('login');
        }

        $validated = $request->validate([
            'data_mode' => 'required|in:demo,clean',

            'admin_name' => 'required|string|max:255',
            'admin_email' => 'required|email|max:255',
            'admin_password' => 'required|string|min:8|confirmed',

            'company_name' => 'required|string|max:255',
            'company_email' => 'nullable|email|max:255',
            'company_phone' => 'nullable|string|max:50',
            'company_address' => 'nullable|string|max:500',

            'currency' => 'required|string|in:USD,GHS,EUR,GBP,NGN',
            'timezone' => 'nullable|string|max:100',
            'date_format' => 'nullable|string|max:20',
            'fiscal_year_start' => 'nullable|string|max:5',

            'uoms' => 'nullable|array',
            'uoms.*' => 'string|max:50',
            'categories' => 'nullable|array',
            'categories.*' => 'string|max:100',
            'departments' => 'nullable|array',
            'departments.*' => 'string|max:100',
        ]);

        $admin = DB::transaction(function () use ($validated) {
            (new PermissionSeeder)->run();
            (new RoleSeeder)->run();

            $adminRole = Role::where('name', 'admin')->firstOrFail();

            $admin = User::create([
                'name' => $validated['admin_name'],
                'email' => $validated['admin_email'],
                'password' => Hash::make($validated['admin_password']),
                'role_id' => $adminRole->id,
                'is_active' => true,
            ]);

            Setting::set('company_name', $validated['company_name']);
            Setting::set('company_email', $validated['company_email'] ?? '');
            Setting::set('company_phone', $validated['company_phone'] ?? '');
            Setting::set('company_address', $validated['company_address'] ?? '');
            Setting::set('currency', $validated['currency']);
            Setting::set('timezone', $validated['timezone'] ?? 'UTC');
            Setting::set('date_format', $validated['date_format'] ?? 'Y-m-d');
            Setting::set('fiscal_year_start', $validated['fiscal_year_start'] ?? '01-01');

            if ($validated['data_mode'] === 'demo') {
                (new ClientSeeder)->run();
                (new InventorySeeder)->run();
                (new MaterialPricesSeeder)->run();
                (new ServiceSeeder)->run();
                (new HrmSeeder)->run();
                (new PurchaseRequestSeeder)->run();
                (new DecisionHubSeeder)->run();
            } else {
                foreach ($validated['uoms'] ?? [] as $uom) {
                    Setting::firstOrCreate(
                        ['key' => 'uom_'.Str::slug($uom)],
                        ['value' => $uom, 'type' => 'string']
                    );
                }

                foreach ($validated['categories'] ?? [] as $category) {
                    ProductCategory::firstOrCreate(['name' => $category]);
                }

                foreach ($validated['departments'] ?? [] as $department) {
                    Department::firstOrCreate(['name' => $department]);
                }
            }

            Setting::set('setup_completed', 'true');

            return $admin;
        });

        Auth::login($admin);

        return redirect()->route('dashboard')->with('success', 'Setup complete — welcome to DPS-ERP!');
    }
}
