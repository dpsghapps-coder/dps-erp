<?php

namespace App\Http\Controllers\HRM;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\EmploymentType;
use App\Models\LeaveType;
use App\Models\Level;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index()
    {
        return inertia('HRM/Settings/Index', [
            'departments' => Department::all(),
            'levels' => Level::all(),
            'employmentTypes' => EmploymentType::all(),
            'leaveTypes' => LeaveType::with('level')->get(),
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

    // Edit Level
    public function editLevel(Level $level)
    {
        return inertia('HRM/Settings/EditLevel', [
            'level' => $level,
        ]);
    }

    public function updateLevel(Request $request, Level $level)
    {
        $level->update($request->validate([
            'name' => 'required|string|max:255',
            'job_title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]));

        return back()->with('success', 'Level updated');
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
            'name' => 'required|string|max:255',
            'level_id' => 'required|exists:levels,id',
            'days_per_year' => 'required\integer',
        ]));

        return back()->with('success', 'Leave type updated');
    }

    public function storeDepartment(Request $request)
    {
        Department::create($request->validate(['name' => 'required|string|max:255']));

        return back()->with('success', 'Department created');
    }

    public function storeLevel(Request $request)
    {
        Level::create($request->validate(['name' => 'required|string|max:255']));

        return back()->with('success', 'Level created');
    }

    public function storeEmploymentType(Request $request)
    {
        EmploymentType::create($request->validate(['name' => 'required|string|max:255']));

        return back()->with('success', 'Employment type created');
    }

    public function storeLeaveType(Request $request)
    {
        LeaveType::create($request->validate([
            'name' => 'required|string|max:255',
            'level_id' => 'required|exists:levels,id',
            'days_per_year' => 'required|integer',
        ]));

        return back()->with('success', 'Leave type created');
    }

    public function destroyDepartment(Department $department)
    {
        $department->delete();

        return back()->with('success', 'Department deleted');
    }

    public function destroyLevel(Level $level)
    {
        $level->delete();

        return back()->with('success', 'Level deleted');
    }

    public function destroyEmploymentType(EmploymentType $employmentType)
    {
        $employmentType->delete();

        return back()->with('success', 'Employment type deleted');
    }

    public function destroyLeaveType(LeaveType $leaveType)
    {
        $leaveType->delete();

        return back()->with('success', 'Leave type deleted');
    }
}
