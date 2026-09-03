<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Employee;
use App\Models\EmploymentType;
use App\Models\Holiday;
use App\Models\LeaveRequest;
use App\Models\Notice;
use App\Models\Payroll;
use App\Models\Performance;
use App\Models\StaffLevel;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

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
            ['name' => 'Human Resources', 'is_active' => true],
            ['name' => 'IT', 'is_active' => true],
        ];

        $deptIds = [];
        foreach ($departments as $dept) {
            $department = Department::firstOrCreate(['name' => $dept['name']], $dept);
            $deptIds[] = $department->id;
        }

        $employmentTypes = [
            ['name' => 'Full-time'],
            ['name' => 'Part-time'],
            ['name' => 'Contract'],
            ['name' => 'Intern'],
        ];
        $etIds = [];
        foreach ($employmentTypes as $et) {
            $type = EmploymentType::firstOrCreate(['name' => $et['name']]);
            $etIds[] = $type->id;
        }

        $staffLevels = [
            ['name' => 'Junior', 'sort_order' => 1],
            ['name' => 'Mid-Level', 'sort_order' => 2],
            ['name' => 'Senior', 'sort_order' => 3],
            ['name' => 'Lead', 'sort_order' => 4],
            ['name' => 'Manager', 'sort_order' => 5],
            ['name' => 'Director', 'sort_order' => 6],
            ['name' => 'Executive', 'sort_order' => 7],
        ];
        $slIds = [];
        foreach ($staffLevels as $sl) {
            $level = StaffLevel::firstOrCreate(['name' => $sl['name']], $sl);
            $slIds[] = $level->id;
        }

        $employees = [
            [
                'first_name' => 'Kwame', 'last_name' => 'Asante', 'email' => 'kwame.asante@dps-erp.com',
                'job_title' => 'Junior Software Developer', 'salary' => 3500, 'mobile_1' => '+233 24 100 0001',
                'mobile_2' => '+233 50 100 0001', 'emergency_person' => 'Ama Asante (+233 20 100 0001)',
                'staff_level_idx' => 0, 'dept_idx' => 0, 'et_idx' => 0,
            ],
            [
                'first_name' => 'Ama', 'last_name' => 'Osei', 'email' => 'ama.osei@dps-erp.com',
                'job_title' => 'Mid-Level Software Developer', 'salary' => 5500, 'mobile_1' => '+233 24 200 0002',
                'mobile_2' => null, 'emergency_person' => 'Kofi Osei (+233 20 200 0002)',
                'staff_level_idx' => 1, 'dept_idx' => 0, 'et_idx' => 0,
            ],
            [
                'first_name' => 'Kofi', 'last_name' => 'Mensah', 'email' => 'kofi.mensah@dps-erp.com',
                'job_title' => 'Senior Software Developer', 'salary' => 8500, 'mobile_1' => '+233 24 300 0003',
                'mobile_2' => '+233 55 300 0003', 'emergency_person' => 'Akua Mensah (+233 20 300 0003)',
                'staff_level_idx' => 2, 'dept_idx' => 0, 'et_idx' => 0,
            ],
            [
                'first_name' => 'Yaw', 'last_name' => ' Boateng', 'email' => 'yaw.boateng@dps-erp.com',
                'job_title' => 'Lead Software Developer', 'salary' => 11000, 'mobile_1' => '+233 24 400 0004',
                'mobile_2' => null, 'emergency_person' => 'Efua Boateng (+233 20 400 0004)',
                'staff_level_idx' => 3, 'dept_idx' => 0, 'et_idx' => 0,
            ],
            [
                'first_name' => 'Abena', 'last_name' => 'Adjei', 'email' => 'abena.adjei@dps-erp.com',
                'job_title' => 'Software Engineering Manager', 'salary' => 14000, 'mobile_1' => '+233 24 500 0005',
                'mobile_2' => '+233 50 500 0005', 'emergency_person' => 'Nana Adjei (+233 20 500 0005)',
                'staff_level_idx' => 4, 'dept_idx' => 0, 'et_idx' => 0,
            ],
            [
                'first_name' => 'Nana', 'last_name' => 'Agyemang', 'email' => 'nana.agyemang@dps-erp.com',
                'job_title' => 'IT Director', 'salary' => 20000, 'mobile_1' => '+233 24 600 0006',
                'mobile_2' => '+233 55 600 0006', 'emergency_person' => 'Yaa Agyemang (+233 20 600 0006)',
                'staff_level_idx' => 5, 'dept_idx' => 6, 'et_idx' => 0,
            ],
            [
                'first_name' => 'Esi', 'last_name' => 'Darko', 'email' => 'esi.darko@dps-erp.com',
                'job_title' => 'Junior Sales Executive', 'salary' => 3000, 'mobile_1' => '+233 24 700 0007',
                'mobile_2' => null, 'emergency_person' => 'Kojo Darko (+233 20 700 0007)',
                'staff_level_idx' => 0, 'dept_idx' => 1, 'et_idx' => 0,
            ],
            [
                'first_name' => 'Kojo', 'last_name' => 'Frimpong', 'email' => 'kojo.frimpong@dps-erp.com',
                'job_title' => 'Mid-Level Sales Representative', 'salary' => 5000, 'mobile_1' => '+233 24 800 0008',
                'mobile_2' => null, 'emergency_person' => 'Aba Frimpong (+233 20 800 0008)',
                'staff_level_idx' => 1, 'dept_idx' => 1, 'et_idx' => 0,
            ],
            [
                'first_name' => 'Afua', 'last_name' => 'Sarpong', 'email' => 'afua.sarpong@dps-erp.com',
                'job_title' => 'Senior Sales Executive', 'salary' => 7500, 'mobile_1' => '+233 24 900 0009',
                'mobile_2' => '+233 50 900 0009', 'emergency_person' => 'Kwesi Sarpong (+233 20 900 0009)',
                'staff_level_idx' => 2, 'dept_idx' => 1, 'et_idx' => 0,
            ],
            [
                'first_name' => 'Kwesi', 'last_name' => 'Appiah', 'email' => 'kwesi.appiah@dps-erp.com',
                'job_title' => 'Sales Team Lead', 'salary' => 9500, 'mobile_1' => '+233 24 100 0010',
                'mobile_2' => null, 'emergency_person' => 'Akosua Appiah (+233 20 100 0010)',
                'staff_level_idx' => 3, 'dept_idx' => 1, 'et_idx' => 0,
            ],
            [
                'first_name' => 'Akosua', 'last_name' => 'Dankwa', 'email' => 'akosua.dankwa@dps-erp.com',
                'job_title' => 'Sales Manager', 'salary' => 12000, 'mobile_1' => '+233 24 110 0011',
                'mobile_2' => '+233 55 110 0011', 'emergency_person' => 'Yaw Dankwa (+233 20 110 0011)',
                'staff_level_idx' => 4, 'dept_idx' => 1, 'et_idx' => 0,
            ],
            [
                'first_name' => 'Adwoa', 'last_name' => 'Boahene', 'email' => 'adwoa.boahene@dps-erp.com',
                'job_title' => 'Junior Marketing Specialist', 'salary' => 3200, 'mobile_1' => '+233 24 120 0012',
                'mobile_2' => null, 'emergency_person' => 'Ama Boahene (+233 20 120 0012)',
                'staff_level_idx' => 0, 'dept_idx' => 2, 'et_idx' => 0,
            ],
            [
                'first_name' => 'Yaw', 'last_name' => 'Preko', 'email' => 'yaw.preko@dps-erp.com',
                'job_title' => 'Mid-Level Marketing Executive', 'salary' => 4800, 'mobile_1' => '+233 24 130 0013',
                'mobile_2' => null, 'emergency_person' => 'Esi Preko (+233 20 130 0013)',
                'staff_level_idx' => 1, 'dept_idx' => 2, 'et_idx' => 0,
            ],
            [
                'first_name' => 'Aba', 'last_name' => 'Yeboah', 'email' => 'aba.yeboah@dps-erp.com',
                'job_title' => 'Senior Marketing Strategist', 'salary' => 7000, 'mobile_1' => '+233 24 140 0014',
                'mobile_2' => '+233 50 140 0014', 'emergency_person' => 'Kofi Yeboah (+233 20 140 0014)',
                'staff_level_idx' => 2, 'dept_idx' => 2, 'et_idx' => 0,
            ],
            [
                'first_name' => 'Nana', 'last_name' => 'Kuma', 'email' => 'nana.kuma@dps-erp.com',
                'job_title' => 'Marketing Team Lead', 'salary' => 9000, 'mobile_1' => '+233 24 150 0015',
                'mobile_2' => null, 'emergency_person' => 'Ama Kuma (+233 20 150 0015)',
                'staff_level_idx' => 3, 'dept_idx' => 2, 'et_idx' => 0,
            ],
            [
                'first_name' => 'Akua', 'last_name' => 'Ofori', 'email' => 'akua.ofori@dps-erp.com',
                'job_title' => 'Operations Coordinator', 'salary' => 3500, 'mobile_1' => '+233 24 160 0016',
                'mobile_2' => null, 'emergency_person' => 'Yaw Ofori (+233 20 160 0016)',
                'staff_level_idx' => 0, 'dept_idx' => 3, 'et_idx' => 0,
            ],
            [
                'first_name' => 'Fiifi', 'last_name' => 'Agbeko', 'email' => 'fiifi.agbeko@dps-erp.com',
                'job_title' => 'Mid-Level Operations Analyst', 'salary' => 5200, 'mobile_1' => '+233 24 170 0017',
                'mobile_2' => '+233 55 170 0017', 'emergency_person' => 'Efua Agbeko (+233 20 170 0017)',
                'staff_level_idx' => 1, 'dept_idx' => 3, 'et_idx' => 0,
            ],
            [
                'first_name' => 'Efua', 'last_name' => 'Andam', 'email' => 'efua.andam@dps-erp.com',
                'job_title' => 'Senior Operations Specialist', 'salary' => 7800, 'mobile_1' => '+233 24 180 0018',
                'mobile_2' => null, 'emergency_person' => 'Kwame Andam (+233 20 180 0018)',
                'staff_level_idx' => 2, 'dept_idx' => 3, 'et_idx' => 0,
            ],
            [
                'first_name' => 'Kweku', 'last_name' => 'Ansah', 'email' => 'kweku.ansah@dps-erp.com',
                'job_title' => 'Operations Manager', 'salary' => 11500, 'mobile_1' => '+233 24 190 0019',
                'mobile_2' => '+233 50 190 0019', 'emergency_person' => 'Abena Ansah (+233 20 190 0019)',
                'staff_level_idx' => 4, 'dept_idx' => 3, 'et_idx' => 0,
            ],
            [
                'first_name' => 'Ama', 'last_name' => 'Quartey', 'email' => 'ama.quartey@dps-erp.com',
                'job_title' => 'Junior Accountant', 'salary' => 3800, 'mobile_1' => '+233 24 200 0020',
                'mobile_2' => null, 'emergency_person' => 'Nana Quartey (+233 20 200 0020)',
                'staff_level_idx' => 0, 'dept_idx' => 4, 'et_idx' => 0,
            ],
            [
                'first_name' => 'Kwadwo', 'last_name' => 'Takyi', 'email' => 'kwadwo.takyi@dps-erp.com',
                'job_title' => 'Mid-Level Financial Analyst', 'salary' => 6000, 'mobile_1' => '+233 24 210 0021',
                'mobile_2' => '+233 55 210 0021', 'emergency_person' => 'Akua Takyi (+233 20 210 0021)',
                'staff_level_idx' => 1, 'dept_idx' => 4, 'et_idx' => 0,
            ],
            [
                'first_name' => 'Abena', 'last_name' => 'Gyamfi', 'email' => 'abena.gyamfi@dps-erp.com',
                'job_title' => 'Senior Accountant', 'salary' => 9000, 'mobile_1' => '+233 24 220 0022',
                'mobile_2' => null, 'emergency_person' => 'Yaw Gyamfi (+233 20 220 0022)',
                'staff_level_idx' => 2, 'dept_idx' => 4, 'et_idx' => 0,
            ],
            [
                'first_name' => 'Nii', 'last_name' => 'Armah', 'email' => 'nii.armah@dps-erp.com',
                'job_title' => 'Finance Director', 'salary' => 18000, 'mobile_1' => '+233 24 230 0023',
                'mobile_2' => '+233 50 230 0023', 'emergency_person' => 'Ama Armah (+233 20 230 0023)',
                'staff_level_idx' => 5, 'dept_idx' => 4, 'et_idx' => 0,
            ],
            [
                'first_name' => 'Eunice', 'last_name' => 'Owusu', 'email' => 'eunice.owusu@dps-erp.com',
                'job_title' => 'Junior HR Officer', 'salary' => 3000, 'mobile_1' => '+233 24 240 0024',
                'mobile_2' => null, 'emergency_person' => 'James Owusu (+233 20 240 0024)',
                'staff_level_idx' => 0, 'dept_idx' => 5, 'et_idx' => 0,
            ],
            [
                'first_name' => 'James', 'last_name' => 'Quayson', 'email' => 'james.quayson@dps-erp.com',
                'job_title' => 'Mid-Level HR Specialist', 'salary' => 5500, 'mobile_1' => '+233 24 250 0025',
                'mobile_2' => '+233 55 250 0025', 'emergency_person' => 'Eunice Quayson (+233 20 250 0025)',
                'staff_level_idx' => 1, 'dept_idx' => 5, 'et_idx' => 0,
            ],
            [
                'first_name' => 'Priscilla', 'last_name' => 'Asare', 'email' => 'priscilla.asare@dps-erp.com',
                'job_title' => 'HR Manager', 'salary' => 10000, 'mobile_1' => '+233 24 260 0026',
                'mobile_2' => null, 'emergency_person' => 'Kojo Asare (+233 20 260 0026)',
                'staff_level_idx' => 4, 'dept_idx' => 5, 'et_idx' => 0,
            ],
            [
                'first_name' => 'Samuel', 'last_name' => 'Tetteh', 'email' => 'samuel.tetteh@dps-erp.com',
                'job_title' => 'Junior IT Support', 'salary' => 2800, 'mobile_1' => '+233 24 270 0027',
                'mobile_2' => null, 'emergency_person' => 'Grace Tetteh (+233 20 270 0027)',
                'staff_level_idx' => 0, 'dept_idx' => 6, 'et_idx' => 0,
            ],
            [
                'first_name' => 'Grace', 'last_name' => 'Lamptey', 'email' => 'grace.lamptey@dps-erp.com',
                'job_title' => 'Mid-Level Systems Administrator', 'salary' => 6000, 'mobile_1' => '+233 24 280 0028',
                'mobile_2' => '+233 50 280 0028', 'emergency_person' => 'Samuel Lamptey (+233 20 280 0028)',
                'staff_level_idx' => 1, 'dept_idx' => 6, 'et_idx' => 0,
            ],
            [
                'first_name' => 'Michael', 'last_name' => 'Nartey', 'email' => 'michael.nartey@dps-erp.com',
                'job_title' => 'Senior Network Engineer', 'salary' => 9500, 'mobile_1' => '+233 24 290 0029',
                'mobile_2' => null, 'emergency_person' => 'Nana Nartey (+233 20 290 0029)',
                'staff_level_idx' => 2, 'dept_idx' => 6, 'et_idx' => 0,
            ],
            [
                'first_name' => 'Patricia', 'last_name' => 'Kwaning', 'email' => 'patricia.kwaning@dps-erp.com',
                'job_title' => 'IT Team Lead', 'salary' => 10500, 'mobile_1' => '+233 24 300 0030',
                'mobile_2' => '+233 55 300 0030', 'emergency_person' => 'Michael Kwaning (+233 20 300 0030)',
                'staff_level_idx' => 3, 'dept_idx' => 6, 'et_idx' => 0,
            ],
        ];

        $empIds = [];
        foreach ($employees as $i => $emp) {
            $data = [
                'employee_number' => 'EMP-' . str_pad($i + 1, 3, '0', STR_PAD_LEFT),
                'first_name' => $emp['first_name'],
                'last_name' => $emp['last_name'],
                'email' => $emp['email'],
                'department_id' => $deptIds[$emp['dept_idx']],
                'staff_level_id' => $slIds[$emp['staff_level_idx']],
                'employment_type_id' => $etIds[$emp['et_idx']],
                'job_title' => $emp['job_title'],
                'date_hired' => Carbon::now()->subMonths(rand(1, 36))->format('Y-m-d'),
                'salary' => $emp['salary'],
                'leave_days' => rand(12, 24),
                'pay_frequency' => 'monthly',
                'mobile_1' => $emp['mobile_1'],
                'mobile_2' => $emp['mobile_2'],
                'emergency_person' => $emp['emergency_person'],
            ];

            if ($emp['staff_level_idx'] >= 3 && $i > 0) {
                $managerIdx = max(0, $i - $emp['staff_level_idx']);
                $data['supervising_manager_id'] = $empIds[$managerIdx] ?? null;
            }

            $employee = Employee::firstOrCreate(
                ['employee_number' => $data['employee_number']],
                $data
            );
            $empIds[] = $employee->id;
        }

        if (count($empIds) >= 2) {
            Department::where('name', 'Engineering')->update(['manager_id' => $empIds[4]]);
            Department::where('name', 'Sales')->update(['manager_id' => $empIds[10]]);
            Department::where('name', 'Marketing')->update(['manager_id' => $empIds[14]]);
            Department::where('name', 'Operations')->update(['manager_id' => $empIds[18]]);
            Department::where('name', 'Finance')->update(['manager_id' => $empIds[22]]);
            Department::where('name', 'Human Resources')->update(['manager_id' => $empIds[25]]);
            Department::where('name', 'IT')->update(['manager_id' => $empIds[5]]);
        }

        $holidays = [
            ['name' => "New Year's Day", 'date' => '2026-01-01', 'type' => 'public'],
            ['name' => 'Martin Luther King Jr. Day', 'date' => '2026-01-19', 'type' => 'public'],
            ['name' => "Presidents' Day", 'date' => '2026-02-16', 'type' => 'public'],
            ['name' => 'Company Foundation Day', 'date' => '2026-03-01', 'type' => 'company'],
            ['name' => 'Good Friday', 'date' => '2026-04-03', 'type' => 'public'],
            ['name' => 'Easter Monday', 'date' => '2026-04-06', 'type' => 'public'],
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
            ['rating' => 4, 'goals' => 'Implement CI/CD pipeline, Reduce downtime', 'achievements' => 'Deploy time cut by 60%, zero downtime incidents', 'comments' => 'Excellent technical skills'],
            ['rating' => 3, 'goals' => 'Improve client retention, Upsell services', 'achievements' => 'Client retention improved by 12%', 'comments' => 'Good relationship building'],
        ];

        foreach ($empIds as $i => $empId) {
            $reviewIndex = $i % count($performanceReviews);
            $reviewDate = Carbon::now()->subDays(rand(30, 90))->format('Y-m-d');
            Performance::firstOrCreate(
                ['employee_id' => $empId, 'review_date' => $reviewDate],
                array_merge($performanceReviews[$reviewIndex], [
                    'employee_id' => $empId,
                    'review_date' => $reviewDate,
                    'reviewer_name' => 'Jane Manager',
                    'status' => 'completed',
                ])
            );
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
            ['employee_id' => $empIds[6], 'leave_type' => 'sick', 'start_date' => '2026-04-27', 'end_date' => '2026-04-27', 'days_count' => 1, 'reason' => 'Not feeling well', 'status' => 'approved'],
            ['employee_id' => $empIds[11], 'leave_type' => 'annual', 'start_date' => '2026-05-01', 'end_date' => '2026-05-05', 'days_count' => 5, 'reason' => 'Wedding anniversary trip', 'status' => 'pending'],
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
