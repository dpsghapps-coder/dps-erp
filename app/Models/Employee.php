<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Employee extends Model
{
    use Auditable;

    protected $fillable = [
        'user_id',
        'employee_number',
        'first_name',
        'last_name',
        'email',
        'avatar',
        'department_id',
        'staff_level_id',
        'employment_type_id',
        'job_title',
        'date_hired',
        'date_terminated',
        'salary',
        'leave_days',
        'pay_frequency',
        'mobile_1',
        'mobile_2',
        'emergency_person',
        'supervising_manager_id',
    ];

    protected $casts = [
        'date_hired' => 'date',
        'date_terminated' => 'date',
        'salary' => 'decimal:2',
        'leave_days' => 'decimal:1',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function staffLevel(): BelongsTo
    {
        return $this->belongsTo(StaffLevel::class);
    }

    public function supervisingManager(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'supervising_manager_id');
    }

    public function employmentType(): BelongsTo
    {
        return $this->belongsTo(EmploymentType::class);
    }

    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }

    public function attendanceLogs(): HasMany
    {
        return $this->hasMany(AttendanceLog::class);
    }

    public function payrolls(): HasMany
    {
        return $this->hasMany(Payroll::class);
    }

    public function performances(): HasMany
    {
        return $this->hasMany(Performance::class);
    }

    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function getInitialsAttribute()
    {
        return ($this->first_name ? $this->first_name[0] : '') . ($this->last_name ? $this->last_name[0] : '');
    }
}
