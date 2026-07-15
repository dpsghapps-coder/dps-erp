<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Employee extends Model
{
    protected $fillable = [
        'user_id',
        'employee_number',
        'first_name',
        'last_name',
        'email',
        'department_id',
        'level_id',
        'employment_type_id',
        'job_title',
        'employment_type',
        'date_hired',
        'date_terminated',
        'salary',
        'leave_balance',
        'pay_frequency',
        'phone',
        'emergency_contact',
    ];

    protected $casts = [
        'employment_type' => 'string',
        'date_hired' => 'date',
        'date_terminated' => 'date',
        'salary' => 'decimal:2',
        'leave_balance' => 'decimal:1',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function level(): BelongsTo
    {
        return $this->belongsTo(Level::class);
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
        return "{$this->first_name?->charAt(0)}{$this->last_name?->charAt(0)}";
    }
}
