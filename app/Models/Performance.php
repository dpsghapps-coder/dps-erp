<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Performance extends Model
{
    protected $fillable = [
        'employee_id',
        'review_date',
        'status',
        'period',
        'initiated_by',
        'goals',
        'achievements',
        'self_rating',
        'self_comments',
        'self_submitted_at',
        'supervisor_employee_id',
        'supervisor_rating',
        'supervisor_comments',
        'supervisor_submitted_at',
        'manager_employee_id',
        'manager_comments',
        'manager_submitted_at',
        'hr_user_id',
        'hr_comments',
        'hr_submitted_at',
    ];

    protected $casts = [
        'review_date' => 'date',
        'self_submitted_at' => 'datetime',
        'supervisor_submitted_at' => 'datetime',
        'manager_submitted_at' => 'datetime',
        'hr_submitted_at' => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function initiatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'initiated_by');
    }

    public function supervisorEmployee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'supervisor_employee_id');
    }

    public function managerEmployee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'manager_employee_id');
    }

    public function hrUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'hr_user_id');
    }
}
