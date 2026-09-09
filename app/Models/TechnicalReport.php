<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TechnicalReport extends Model
{
    public const CATEGORIES = [
        'Software Problem',
        'HVAC',
        'Electricity',
        'Machine Errors',
        'Replacement',
        'Internet & Network',
        'Other',
    ];

    public const SEVERITIES = ['low', 'medium', 'high', 'critical'];

    public const STATUSES = ['new', 'in_progress', 'resolved', 'closed'];

    protected $fillable = [
        'user_id',
        'department_id',
        'category',
        'title',
        'description',
        'severity',
        'location',
        'status',
        'assigned_to',
        'resolution_notes',
        'resolved_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
