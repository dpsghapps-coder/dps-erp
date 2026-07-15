<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Permission;
use App\Models\ProductCategory;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
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
        $users = User::with('role', 'departmentManager', 'employee')->orderBy('created_at', 'desc')->paginate(25);
        $departments = Department::where('is_active', true)->orderBy('name')->get();

        return inertia('Admin/Users/Index', ['users' => $users, 'departments' => $departments]);
    }

    public function userCreate()
    {
        $roles = Role::all();
        $managers = User::where('role_id', Role::where('name', 'manager')->value('id'))
            ->orderBy('name')
            ->get();
        $departments = Department::where('is_active', true)->orderBy('name')->get();
        $employees = Employee::whereNull('user_id')->orderBy('first_name')->get();

        return inertia('Admin/Users/Create', [
            'roles' => $roles,
            'managers' => $managers,
            'departments' => $departments,
            'employees' => $employees,
        ]);
    }

    public function userStore(Request $request)
    {
        $departmentNames = Department::where('is_active', true)->pluck('name')->toArray();
        $deptValidation = $departmentNames ? 'in:'.implode(',', $departmentNames) : 'nullable';

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'role_id' => 'nullable|exists:roles,id',
            'is_active' => 'boolean',
            'department' => 'nullable|string|'.$deptValidation,
            'department_manager_id' => 'nullable|exists:users,id',
            'employee_id' => 'nullable|exists:employees,id',
            'avatar' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('avatar')) {
            $validated['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        unset($validated['avatar']);

        $employeeId = $validated['employee_id'] ?? null;
        unset($validated['employee_id']);

        $user = User::create($validated);

        if ($employeeId) {
            $user->update(['employee_id' => $employeeId]);
            Employee::where('id', $employeeId)->update(['user_id' => $user->id]);
        }

        if ($request->hasFile('avatar')) {
            $user->update(['avatar' => $request->file('avatar')->store('avatars', 'public')]);
        }

        return redirect()->route('admin.users')->with('success', 'User created successfully');
    }

    public function userEdit(User $user)
    {
        $roles = Role::all();
        $managers = User::where('role_id', Role::where('name', 'manager')->value('id'))
            ->orderBy('name')
            ->get();
        $departments = Department::where('is_active', true)->orderBy('name')->get();
        $employees = Employee::whereNull('user_id')->orWhere('user_id', $user->id)->orderBy('first_name')->get();

        return inertia('Admin/Users/Edit', [
            'user' => $user,
            'roles' => $roles,
            'managers' => $managers,
            'departments' => $departments,
            'employees' => $employees,
        ]);
    }

    public function userUpdate(Request $request, User $user)
    {
        $departmentNames = Department::where('is_active', true)->pluck('name')->toArray();
        $deptValidation = $departmentNames ? 'in:'.implode(',', $departmentNames) : 'nullable';

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$user->id,
            'role_id' => 'nullable|exists:roles,id',
            'is_active' => 'boolean',
            'department' => 'nullable|string|'.$deptValidation,
            'department_manager_id' => 'nullable|exists:users,id',
            'employee_id' => 'nullable|exists:employees,id',
            'avatar' => 'nullable|image|max:2048',
        ]);

        if ($request->filled('password')) {
            $validated['password'] = $request->password;
        }

        $employeeId = $validated['employee_id'] ?? null;
        unset($validated['employee_id']);

        if ($request->hasFile('avatar')) {
            $validated['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $oldEmployeeId = $user->employee_id;

        $user->update($validated);

        if ($employeeId != $oldEmployeeId) {
            if ($oldEmployeeId) {
                Employee::where('id', $oldEmployeeId)->update(['user_id' => null]);
            }
            if ($employeeId) {
                $user->update(['employee_id' => $employeeId]);
                Employee::where('id', $employeeId)->update(['user_id' => $user->id]);
            } else {
                $user->update(['employee_id' => null]);
            }
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
        $uoms = \App\Models\Setting::where('key', 'like', 'uom_%')->get();
        $categories = ProductCategory::with('attributes')->orderBy('name')->get();
        $attributes = \App\Models\Setting::where('key', 'like', 'attr_%')->get();
        $departments = Department::orderBy('name')->get();

        return inertia('Admin/Settings', ['uoms' => $uoms, 'categories' => $categories, 'attributes' => $attributes, 'departments' => $departments]);
    }

    public function settingsUpdate(Request $request)
    {
        return back()->with('success', 'Settings saved successfully');
    }

    public function storeUom(Request $request)
    {
        $validated = $request->validate(['value' => 'required|string|max:50']);

        \App\Models\Setting::create([
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

        if (\App\Models\Setting::where('key', $key)->exists()) {
            return back()->withErrors(['value' => 'This attribute already exists.']);
        }

        \App\Models\Setting::create([
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

    public function storeDepartment(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:departments,name',
            'code' => 'nullable|string|max:20|unique:departments,code',
            'description' => 'nullable|string|max:255',
        ]);

        Department::create([
            'name' => $validated['name'],
            'code' => $validated['code'] ?? null,
            'description' => $validated['description'] ?? null,
            'is_active' => true,
        ]);

        return back()->with('success', 'Department added successfully');
    }

    public function deleteDepartment(Department $department)
    {
        $department->delete();

        return back()->with('success', 'Department deleted');
    }
}
