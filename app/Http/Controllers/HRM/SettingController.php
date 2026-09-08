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
            'leaveTypeNames' => LeaveType::TYPES,
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

    /**
     * Bulk upsert leave-type allowances from the matrix (staff level x leave
     * type name). A blank days_per_year deletes the corresponding entry —
     * this is how a cell gets "unset" in the grid.
     */
    public function storeLeaveTypeMatrix(Request $request)
    {
        $validated = $request->validate([
            'entries' => 'required|array',
            'entries.*.staff_level_id' => 'required|exists:staff_levels,id',
            'entries.*.name' => 'required|in:'.implode(',', LeaveType::TYPES),
            'entries.*.days_per_year' => 'nullable|integer|min:0',
        ]);

        $blocked = [];

        foreach ($validated['entries'] as $entry) {
            if ($entry['days_per_year'] === null) {
                $existing = LeaveType::where('staff_level_id', $entry['staff_level_id'])
                    ->where('name', $entry['name'])
                    ->first();

                if (! $existing) {
                    continue;
                }

                if (LeaveRequest::where('leave_type_id', $existing->id)->exists()) {
                    $blocked[] = "{$existing->name} ({$existing->staffLevel?->name})";

                    continue;
                }

                $existing->delete();

                continue;
            }

            LeaveType::updateOrCreate(
                ['staff_level_id' => $entry['staff_level_id'], 'name' => $entry['name']],
                ['days_per_year' => $entry['days_per_year']]
            );
        }

        if ($blocked) {
            return back()->withErrors([
                'entries' => 'Could not clear these — they have existing leave requests: '.implode(', ', $blocked),
            ])->with('success', 'Other leave type changes were saved.');
        }

        return back()->with('success', 'Leave types updated');
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

    // Staff Level CRUD
    public function storeStaffLevel(Request $request)
    {
        StaffLevel::create($request->validate([
            'name' => 'required|string|max:255|unique:staff_levels',
            'is_manager' => 'nullable|boolean',
        ]));

        return back()->with('success', 'Staff level created');
    }

    public function editStaffLevel(StaffLevel $staffLevel)
    {
        return inertia('HRM/Settings/EditStaffLevel', [
            'staffLevel' => $staffLevel,
        ]);
    }

    public function updateStaffLevel(Request $request, StaffLevel $staffLevel)
    {
        $staffLevel->update($request->validate([
            'name' => 'required|string|max:255|unique:staff_levels,name,'.$staffLevel->id,
            'is_manager' => 'nullable|boolean',
        ]));

        return back()->with('success', 'Staff level updated');
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
