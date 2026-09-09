<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeInvite extends Model
{
    protected $fillable = [
        'token',
        'created_by',
        'expires_at',
        'first_name',
        'last_name',
        'email',
        'mobile_1',
        'mobile_2',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relation',
        'avatar',
        'submitted_at',
        'approved_at',
        'approved_employee_id',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    protected $appends = ['status'];

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approvedEmployee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'approved_employee_id');
    }

    public function getStatusAttribute(): string
    {
        if ($this->approved_at) {
            return 'approved';
        }

        if ($this->submitted_at) {
            return 'submitted';
        }

        if ($this->expires_at->isPast()) {
            return 'expired';
        }

        return 'pending';
    }
}
