<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Employee;
use App\Models\Holiday;
use App\Models\LeaveRequest;
use App\Models\Notice;
use App\Models\Payroll;
use App\Models\Performance;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class HrmSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['name' => 'Engineering', 'is_active' => true],
            ['name' => 'Sales', 'is_active' => true],
            ['name' => 'Marketing', 'is_active' => true],
            ['name' => 'Operations', 'is_active' => true],
            ['name' => 'Finance', 'is_active' => true],
        ];

        $deptIds = [];
        foreach ($departments as $dept) {
            $department = Department::firstOrCreate($dept);
            $deptIds[] = $department->id;
        }

        $employees = [
            ['first_name' => 'John', 'last_name' => 'Smith', 'employee_number' => 'EMP-001', 'job_title' => 'Senior Developer', 'employment_type' => 'full_time', 'salary' => 95000, 'leave_balance' => 18],
            ['first_name' => 'Sarah', 'last_name' => 'Johnson', 'employee_number' => 'EMP-002', 'job_title' => 'Sales Manager', 'employment_type' => 'full_time', 'salary' => 85000, 'leave_balance' => 15],
            ['first_name' => 'Mike', 'last_name' => 'Chen', 'employee_number' => 'EMP-003', 'job_title' => 'Marketing Lead', 'employment_type' => 'full_time', 'salary' => 78000, 'leave_balance' => 20],
            ['first_name' => 'Emily', 'last_name' => 'Davis', 'employee_number' => 'EMP-004', 'job_title' => 'Operations Manager', 'employment_type' => 'full_time', 'salary' => 72000, 'leave_balance' => 12],
            ['first_name' => 'James', 'last_name' => 'Wilson', 'employee_number' => 'EMP-005', 'job_title' => 'Financial Analyst', 'employment_type' => 'full_time', 'salary' => 68000, 'leave_balance' => 19],
            ['first_name' => 'Lisa', 'last_name' => 'Brown', 'employee_number' => 'EMP-006', 'job_title' => 'DevOps Engineer', 'employment_type' => 'full_time', 'salary' => 82000, 'leave_balance' => 17],
            ['first_name' => 'Robert', 'last_name' => 'Taylor', 'employee_number' => 'EMP-007', 'job_title' => 'Frontend Developer', 'employment_type' => 'full_time', 'salary' => 75000, 'leave_balance' => 20],
            ['first_name' => 'Amanda', 'last_name' => 'White', 'employee_number' => 'EMP-008', 'job_title' => 'Account Executive', 'employment_type' => 'full_time', 'salary' => 65000, 'leave_balance' => 18],
        ];

        $empIds = [];
        foreach ($employees as $i => $emp) {
            $emp['department_id'] = $deptIds[$i % count($deptIds)];
            $emp['date_hired'] = Carbon::now()->subMonths(rand(1, 36))->format('Y-m-d');
            $emp['email'] = strtolower($emp['first_name'].'.'.$emp['last_name']).'@company.com';
            $emp['phone'] = '+1 555-'.str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
            $empIds[] = Employee::firstOrCreate(['employee_number' => $emp['employee_number']], $emp)->id;
        }

        $holidays = [
            ['name' => "New Year's Day", 'date' => '2026-01-01', 'type' => 'public'],
            ['name' => 'Martin Luther King Jr. Day', 'date' => '2026-01-19', 'type' => 'public'],
            ['name' => "Presidents' Day", 'date' => '2026-02-16', 'type' => 'public'],
            ['name' => 'Company Foundation Day', 'date' => '2026-03-01', 'type' => 'company'],
            ['name' => 'Good Friday', 'date' => '2026-04-03', 'type' => 'public'],
            ['name' => 'Memorial Day', 'date' => '2026-05-25', 'type' => 'public'],
            ['name' => 'Company Anniversary', 'date' => '2026-06-15', 'type' => 'company'],
            ['name' => 'Independence Day', 'date' => '2026-07-04', 'type' => 'public'],
            ['name' => 'Labor Day', 'date' => '2026-09-07', 'type' => 'public'],
            ['name' => 'Columbus Day', 'date' => '2026-10-12', 'type' => 'public'],
            ['name' => 'Veterans Day', 'date' => '2026-11-11', 'type' => 'public'],
            ['name' => 'Thanksgiving', 'date' => '2026-11-26', 'type' => 'public'],
            ['name' => 'Christmas', 'date' => '2026-12-25', 'type' => 'public'],
            ['name' => 'Boxing Day', 'date' => '2026-12-26', 'type' => 'public'],
            ['name' => 'Company Year End Party', 'date' => '2026-12-31', 'type' => 'company'],
        ];

        foreach ($holidays as $holiday) {
            Holiday::firstOrCreate(['date' => $holiday['date']], $holiday);
        }

        $months = ['2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04'];
        foreach ($empIds as $empId) {
            $baseSalary = 7000 + rand(-1000, 2500);
            foreach ($months as $month) {
                $allowances = rand(300, 600);
                $overtime = rand(0, 300);
                $bonuses = rand(0, 1000);
                $tax = intval($baseSalary * 0.22);
                $gross = $baseSalary + $allowances + $overtime + $bonuses;
                $net = $gross - $tax - 1200;
                Payroll::firstOrCreate(
                    ['employee_id' => $empId, 'month' => $month],
                    [
                        'employee_id' => $empId,
                        'month' => $month,
                        'basic_salary' => $baseSalary,
                        'allowances' => $allowances,
                        'overtime' => $overtime,
                        'bonuses' => $bonuses,
                        'deductions_tax' => $tax,
                        'deductions_insurance' => 400,
                        'deductions_retirement' => 800,
                        'deductions_other' => 0,
                        'gross_pay' => $gross,
                        'net_pay' => $net,
                        'status' => 'paid',
                    ]
                );
            }
        }

        $performanceReviews = [
            ['rating' => 4, 'goals' => 'Complete React certification, Lead team project', 'achievements' => 'Delivered Q1 dashboard ahead of schedule', 'comments' => 'Excellent performance, strong leadership'],
            ['rating' => 5, 'goals' => 'Exceed sales targets by 20%, Train new hires', 'achievements' => 'Achieved 150% of target, mentored 3 new team members', 'comments' => 'Outstanding results, great mentor'],
            ['rating' => 3, 'goals' => 'Improve SEO rankings, Launch new campaigns', 'achievements' => 'Rankings improved by 30%, launched 2 campaigns', 'comments' => 'Good progress, room for improvement'],
            ['rating' => 4, 'goals' => 'Streamline operations, Reduce costs', 'achievements' => 'Reduced operational costs by 15%', 'comments' => 'Strong operational skills'],
        ];

        foreach ($empIds as $i => $empId) {
            if (isset($performanceReviews[$i])) {
                $reviewDate = Carbon::now()->subDays(rand(30, 90))->format('Y-m-d');
                Performance::firstOrCreate(
                    ['employee_id' => $empId, 'review_date' => $reviewDate],
                    array_merge($performanceReviews[$i], [
                        'employee_id' => $empId,
                        'review_date' => $reviewDate,
                        'reviewer_name' => 'Jane Manager',
                        'status' => 'completed',
                    ])
                );
            }
        }

        $notices = [
            ['title' => 'Q2 All-Hands Meeting', 'content' => 'Join us for our quarterly all-hands meeting this Friday at 2 PM.', 'type' => 'announcement', 'is_pinned' => true],
            ['title' => 'New Office Policy Update', 'content' => 'Please note the updated office hours: 9 AM - 6 PM effective next Monday.', 'type' => 'general', 'is_pinned' => false],
            ['title' => 'System Maintenance Notice', 'content' => 'The ERP system will be down for maintenance this Sunday from 2 AM - 6 AM.', 'type' => 'general', 'is_pinned' => false],
            ['title' => 'Welcome New Team Members', 'content' => 'Please welcome our new team members joining this week.', 'type' => 'announcement', 'is_pinned' => false],
        ];

        foreach ($notices as $notice) {
            Notice::firstOrCreate(['title' => $notice['title']], $notice);
        }

        $leaveRequests = [
            ['employee_id' => $empIds[0], 'leave_type' => 'annual', 'start_date' => '2026-04-28', 'end_date' => '2026-04-30', 'days_count' => 3, 'reason' => 'Family vacation', 'status' => 'pending'],
            ['employee_id' => $empIds[1], 'leave_type' => 'sick', 'start_date' => '2026-04-27', 'end_date' => '2026-04-27', 'days_count' => 1, 'reason' => 'Not feeling well', 'status' => 'approved'],
            ['employee_id' => $empIds[2], 'leave_type' => 'annual', 'start_date' => '2026-05-01', 'end_date' => '2026-05-05', 'days_count' => 5, 'reason' => 'Wedding anniversary trip', 'status' => 'pending'],
        ];

        foreach ($leaveRequests as $lr) {
            LeaveRequest::firstOrCreate(
                ['employee_id' => $lr['employee_id'], 'start_date' => $lr['start_date']],
                $lr
            );
        }

        echo "HRM seed data created successfully!\n";
    }
}
