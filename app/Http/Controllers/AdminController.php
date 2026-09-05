<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Permission;
use App\Models\ProductCategory;
use App\Models\Role;
use App\Models\Setting;
use App\Models\StaffLevel;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    public function index()
    {
        $stats = [
            'total_users' => User::count(),
            'active_users' => User::where('is_active', true)->count(),
            'total_roles' => Role::count(),
            'total_departments' => Department::count(),
            'recent_activity' => AuditLog::orderBy('created_at', 'desc')->limit(10)->get(),
        ];

        return inertia('Admin/Index', $stats);
    }

    public function users()
    {
        $users = User::with('role', 'employee.department', 'employee.staffLevel')->orderBy('created_at', 'desc')->paginate(25);
        $departments = Department::where('is_active', true)->orderBy('name')->get();

        return inertia('Admin/Users/Index', ['users' => $users, 'departments' => $departments]);
    }

    public function userCreate()
    {
        $roles = Role::all();
        $employees = Employee::whereNull('user_id')->with('department')->orderBy('first_name')->get();

        return inertia('Admin/Users/Create', [
            'roles' => $roles,
            'employees' => $employees,
        ]);
    }

    public function userStore(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'role_id' => 'nullable|exists:roles,id',
            'is_active' => 'boolean',
            'employee_id' => 'nullable|exists:employees,id',
            'avatar' => 'nullable|image|max:2048',
        ]);

        $employeeId = $validated['employee_id'] ?? null;
        unset($validated['employee_id']);

        $avatarPath = null;
        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
        }
        unset($validated['avatar']);

        $validated['name'] = '';

        $user = User::create($validated);

        if ($employeeId) {
            $employee = Employee::find($employeeId);
            $updateData = ['user_id' => $user->id];
            if ($avatarPath) {
                $updateData['avatar'] = $avatarPath;
            }
            $employee->update($updateData);
            $user->update([
                'employee_id' => $employeeId,
                'name' => $employee->first_name . ' ' . $employee->last_name,
            ]);
        }

        return redirect()->route('admin.users')->with('success', 'User created successfully');
    }

    public function userEdit(User $user)
    {
        $roles = Role::all();
        $employees = Employee::whereNull('user_id')->orWhere('user_id', $user->id)->with('department')->orderBy('first_name')->get();

        return inertia('Admin/Users/Edit', [
            'user' => $user->load('employee.department'),
            'roles' => $roles,
            'employees' => $employees,
        ]);
    }

    public function userUpdate(Request $request, User $user)
    {
        $validated = $request->validate([
            'email' => 'required|email|unique:users,email,'.$user->id,
            'role_id' => 'nullable|exists:roles,id',
            'is_active' => 'boolean',
            'employee_id' => 'nullable|exists:employees,id',
            'avatar' => 'nullable|image|max:2048',
        ]);

        if ($request->filled('password')) {
            $validated['password'] = $request->password;
        }

        $employeeId = $validated['employee_id'] ?? null;
        unset($validated['employee_id']);

        $avatarPath = null;
        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
        }
        unset($validated['avatar']);

        $oldEmployeeId = $user->employee_id;

        if ($oldEmployeeId && $employeeId != $oldEmployeeId) {
            return back()->withErrors(['employee_id' => 'Employee is already linked to this user and cannot be changed.']);
        }

        if ($employeeId && $employeeId != $oldEmployeeId) {
            $employee = Employee::find($employeeId);
            $validated['employee_id'] = $employeeId;
            $validated['name'] = $employee->first_name . ' ' . $employee->last_name;
            $employee->update(['user_id' => $user->id]);
        }

        $user->update($validated);

        if ($avatarPath && $user->employee) {
            $user->employee->update(['avatar' => $avatarPath]);
        }

        return redirect()->route('admin.users')->with('success', 'User updated successfully');
    }

    public function roles()
    {
        $roles = Role::with('permissions')->get();
        $permissions = Permission::orderBy('module')->orderBy('name')->get();

        return inertia('Admin/Roles/Index', ['roles' => $roles, 'permissions' => $permissions]);
    }

    public function roleCreate()
    {
        $permissions = Permission::orderBy('module')->orderBy('name')->get();

        return inertia('Admin/Roles/Create', ['permissions' => $permissions]);
    }

    public function roleStore(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'display_name' => $validated['display_name'],
            'description' => $validated['description'] ?? null,
        ]);

        if (! empty($validated['permissions'])) {
            $role->permissions()->sync($validated['permissions']);
        }

        return redirect()->route('admin.roles')->with('success', 'Role created successfully');
    }

    public function roleEdit(Role $role)
    {
        $role->load('permissions');
        $permissions = Permission::orderBy('module')->orderBy('name')->get();

        return inertia('Admin/Roles/Edit', ['role' => $role, 'permissions' => $permissions]);
    }

    public function roleUpdate(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,'.$role->id,
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role->update([
            'name' => $validated['name'],
            'display_name' => $validated['display_name'],
            'description' => $validated['description'] ?? null,
        ]);

        $role->permissions()->sync($validated['permissions'] ?? []);

        return redirect()->route('admin.roles')->with('success', 'Role updated successfully');
    }

    public function roleDestroy(Role $role)
    {
        if ($role->name === 'admin') {
            return back()->withErrors(['error' => 'Cannot delete the admin role.']);
        }

        $role->users()->update(['role_id' => null]);
        $role->permissions()->detach();
        $role->delete();

        return redirect()->route('admin.roles')->with('success', 'Role deleted successfully');
    }

    public function settings()
    {
        $uoms = Setting::where('key', 'like', 'uom_%')->get();
        $categories = ProductCategory::with('attributes')->orderBy('name')->get();
        $attributes = Setting::where('key', 'like', 'attr_%')->get();
        $extraCostTypes = Setting::where('key', 'like', 'extra_cost_%')->get();
        $departments = Department::orderBy('name')->get();
        $currency = Setting::get('currency', 'GHS');
        $companyLogo = Setting::get('company_logo');

        return inertia('Admin/Settings', [
            'uoms' => $uoms,
            'categories' => $categories,
            'attributes' => $attributes,
            'extraCostTypes' => $extraCostTypes,
            'departments' => $departments,
            'currency' => $currency,
            'companyLogo' => $companyLogo ? Storage::url($companyLogo) : null,
        ]);
    }

    /**
     * Tables preserved by a factory reset: framework/system infrastructure
     * (migrations, sessions, queue, cache) and access-control structure
     * (roles, permissions, settings, users — the latter pruned down to the
     * admin performing the reset, not left untouched). Everything else is
     * treated as business/transactional data and wiped.
     */
    const FACTORY_RESET_KEPT_TABLES = [
        'migrations', 'sessions', 'cache', 'cache_locks', 'jobs', 'job_batches',
        'failed_jobs', 'password_reset_tokens', 'roles', 'permissions',
        'role_permission', 'settings', 'users', 'sqlite_sequence',
    ];

    public function factoryReset(Request $request)
    {
        $validated = $request->validate([
            'password' => 'required|string',
            'confirmation' => 'required|string',
        ]);

        if ($validated['confirmation'] !== 'RESET') {
            return back()->withErrors(['confirmation' => 'Type RESET exactly to confirm.']);
        }

        $admin = auth()->user();

        if (! Hash::check($validated['password'], $admin->password)) {
            return back()->withErrors(['password' => 'Incorrect password.']);
        }

        Log::warning("Factory reset initiated by user #{$admin->id} ({$admin->email})");

        $dbPath = config('database.connections.sqlite.database');
        $backupDir = storage_path('app/backups');

        if (! is_dir($backupDir)) {
            mkdir($backupDir, 0755, true);
        }

        $backupPath = $backupDir.'/database-'.now()->format('Y-m-d_His').'.sqlite';

        if (! copy($dbPath, $backupPath)) {
            Log::error('Factory reset aborted: database backup failed.');

            return back()->withErrors(['password' => 'Backup failed — reset aborted. No data was changed.']);
        }

        $tables = DB::select("SELECT name FROM sqlite_master WHERE type = 'table'");
        $hasSequenceTable = collect($tables)->contains(fn ($t) => $t->name === 'sqlite_sequence');
        $wipedTables = [];

        DB::statement('PRAGMA foreign_keys = OFF');

        DB::transaction(function () use ($tables, $admin, $hasSequenceTable, &$wipedTables) {
            foreach ($tables as $table) {
                $name = $table->name;

                if (in_array($name, self::FACTORY_RESET_KEPT_TABLES, true)) {
                    continue;
                }

                DB::table($name)->delete();

                if ($hasSequenceTable) {
                    DB::table('sqlite_sequence')->where('name', $name)->delete();
                }

                $wipedTables[] = $name;
            }

            User::where('id', '!=', $admin->id)->delete();
        });

        DB::statement('PRAGMA foreign_keys = ON');

        AuditLog::create([
            'user_id' => $admin->id,
            'action' => 'factory_reset',
            'new_values' => [
                'backup_path' => $backupPath,
                'tables_wiped' => count($wipedTables),
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', 'Factory reset complete. Business data has been wiped; a backup was saved on the server before the reset.');
    }

    public function settingsUpdate(Request $request)
    {
        $validated = $request->validate([
            'currency' => 'nullable|string|in:USD,GHS,EUR,GBP,NGN',
            'company_logo' => 'nullable|image|max:2048',
            'remove_logo' => 'nullable|boolean',
        ]);

        if ($request->has('currency')) {
            Setting::set('currency', $request->input('currency', 'GHS'));
        }

        if ($request->hasFile('company_logo')) {
            $oldLogo = Setting::get('company_logo');
            if ($oldLogo) {
                Storage::disk('public')->delete($oldLogo);
            }
            Setting::set('company_logo', $request->file('company_logo')->store('logos', 'public'));
        } elseif ($request->boolean('remove_logo')) {
            $oldLogo = Setting::get('company_logo');
            if ($oldLogo) {
                Storage::disk('public')->delete($oldLogo);
            }
            Setting::set('company_logo', '');
        }

        return back()->with('success', 'Settings saved successfully');
    }

    public function storeUom(Request $request)
    {
        $validated = $request->validate(['value' => 'required|string|max:50']);

        Setting::create([
            'key' => 'uom_'.Str::slug($validated['value']),
            'value' => $validated['value'],
            'type' => 'string',
        ]);

        return back()->with('success', 'UOM added successfully');
    }

    public function deleteUom(Setting $setting)
    {
        if (str_starts_with($setting->key, 'uom_')) {
            $setting->delete();
        }

        return back()->with('success', 'UOM deleted');
    }

    public function storeCategory(Request $request)
    {
        $validated = $request->validate(['value' => 'required|string|max:50']);

        ProductCategory::create(['name' => $validated['value']]);

        return back()->with('success', 'Category added successfully');
    }

    public function deleteCategory(ProductCategory $productCategory)
    {
        $productCategory->delete();

        return back()->with('success', 'Category deleted');
    }

    public function storeAttribute(Request $request)
    {
        $validated = $request->validate(['value' => 'required|string|max:50']);

        $key = 'attr_'.Str::slug($validated['value']);

        if (Setting::where('key', $key)->exists()) {
            return back()->withErrors(['value' => 'This attribute already exists.']);
        }

        Setting::create([
            'key' => $key,
            'value' => $validated['value'],
            'type' => 'string',
        ]);

        return back()->with('success', 'Attribute added successfully');
    }

    public function deleteAttribute(Setting $setting)
    {
        if (str_starts_with($setting->key, 'attr_')) {
            $setting->delete();
        }

        return back()->with('success', 'Attribute deleted');
    }

    public function storeExtraCostType(Request $request)
    {
        $validated = $request->validate(['value' => 'required|string|max:50']);

        $key = 'extra_cost_'.Str::slug($validated['value']);

        if (Setting::where('key', $key)->exists()) {
            return back()->withErrors(['value' => 'This cost type already exists.']);
        }

        Setting::create([
            'key' => $key,
            'value' => $validated['value'],
            'type' => 'string',
        ]);

        return back()->with('success', 'Cost type added successfully');
    }

    public function deleteExtraCostType(Setting $setting)
    {
        if (str_starts_with($setting->key, 'extra_cost_')) {
            $setting->delete();
        }

        return back()->with('success', 'Cost type deleted');
    }

    public function toggleCategoryAttribute(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:product_categories,id',
            'setting_id' => 'required|exists:settings,id',
        ]);

        $category = ProductCategory::findOrFail($validated['category_id']);
        $settingId = $validated['setting_id'];

        if ($category->attributes()->where('setting_id', $settingId)->exists()) {
            $category->attributes()->detach($settingId);
            $attached = false;
        } else {
            $category->attributes()->attach($settingId);
            $attached = true;
        }

        return back()->with('success', $attached ? 'Attribute linked to category' : 'Attribute unlinked from category');
    }
}
