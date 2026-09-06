<?php

namespace App\Http\Controllers\HRM;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Employee;
use App\Models\EmploymentType;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\StaffLevel;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index()
    {
        return inertia('HRM/Settings/Index', [
            'departments' => Department::all(),
            'employmentTypes' => EmploymentType::all(),
            'leaveTypes' => LeaveType::with('staffLevel')->get(),
            'staffLevels' => StaffLevel::orderBy('sort_order')->get(),
        ]);
    }

    // Edit Department
    public function editDepartment(Department $department)
    {
        return inertia('HRM/Settings/EditDepartment', [
            'department' => $department,
        ]);
    }

    public function updateDepartment(Request $request, Department $department)
    {
        $department->update($request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'manager_id' => 'nullable|exists:employees,id',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]));

        return back()->with('success', 'Department updated');
    }

    // Edit Employment Type
    public function editEmploymentType(EmploymentType $employmentType)
    {
        return inertia('HRM/Settings/EditEmploymentType', [
            'employmentType' => $employmentType,
        ]);
    }

    public function updateEmploymentType(Request $request, EmploymentType $employmentType)
    {
        $employmentType->update($request->validate([
            'name' => 'required|string|max:255',
        ]));

        return back()->with('success', 'Employment type updated');
    }

    // Edit Leave Type
    public function editLeaveType(LeaveType $leaveType)
    {
        return inertia('HRM/Settings/EditLeaveType', [
            'leaveType' => $leaveType,
        ]);
    }

    public function updateLeaveType(Request $request, LeaveType $leaveType)
    {
        $leaveType->update($request->validate([
            'name' => 'required|in:'.implode(',', LeaveType::TYPES).'|unique:leave_types,name,'.$leaveType->id.',id,staff_level_id,'.$request->input('staff_level_id'),
            'staff_level_id' => 'required|exists:staff_levels,id',
            'days_per_year' => 'required|integer|min:0',
        ]));

        return back()->with('success', 'Leave type updated');
    }

    public function storeDepartment(Request $request)
    {
        Department::create($request->validate(['name' => 'required|string|max:255']));

        return back()->with('success', 'Department created');
    }

    public function storeEmploymentType(Request $request)
    {
        EmploymentType::create($request->validate(['name' => 'required|string|max:255']));

        return back()->with('success', 'Employment type created');
    }

    public function storeLeaveType(Request $request)
    {
        LeaveType::create($request->validate([
            'name' => 'required|in:'.implode(',', LeaveType::TYPES).'|unique:leave_types,name,NULL,id,staff_level_id,'.$request->input('staff_level_id'),
            'staff_level_id' => 'required|exists:staff_levels,id',
            'days_per_year' => 'required|integer|min:0',
        ]));

        return back()->with('success', 'Leave days created');
    }

    public function destroyDepartment(Department $department)
    {
        if ($department->employees()->exists()) {
            return back()->withErrors('Cannot delete department with assigned employees.');
        }

        $department->delete();

        return back()->with('success', 'Department deleted');
    }

    public function destroyEmploymentType(EmploymentType $employmentType)
    {
        if (Employee::where('employment_type_id', $employmentType->id)->exists()) {
            return back()->withErrors('Cannot delete employment type with assigned employees.');
        }

        $employmentType->delete();

        return back()->with('success', 'Employment type deleted');
    }

    public function destroyLeaveType(LeaveType $leaveType)
    {
        if (LeaveRequest::where('leave_type_id', $leaveType->id)->exists()) {
            return back()->withErrors('Cannot delete leave type with existing leave requests.');
        }

        $leaveType->delete();

        return back()->with('success', 'Leave type deleted');
    }

    // Staff Level CRUD
    public function storeStaffLevel(Request $request)
    {
        StaffLevel::create($request->validate([
            'name' => 'required|string|max:255|unique:staff_levels',
        ]));

        return back()->with('success', 'Staff level created');
    }

    public function destroyStaffLevel(StaffLevel $staffLevel)
    {
        if ($staffLevel->employees()->exists() || LeaveType::where('staff_level_id', $staffLevel->id)->exists()) {
            return back()->withErrors('Cannot delete staff level with assigned employees or leave types.');
        }

        $staffLevel->delete();

        return back()->with('success', 'Staff level deleted');
    }
}
