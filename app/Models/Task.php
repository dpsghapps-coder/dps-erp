<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    public const FREQUENCIES = ['one_time', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'];

    public const PRIORITIES = ['low', 'normal', 'high'];

    public const ASSIGNEE_STATUSES = ['not_started', 'in_progress', 'completed'];

    protected $fillable = [
        'title', 'description', 'deadline', 'frequency', 'priority',
        'status', 'created_by', 'closed_by', 'closed_at',
    ];

    protected $casts = [
        'deadline' => 'date',
        'closed_at' => 'datetime',
    ];

    public function assignees(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'task_assignees')
            ->withPivot(['status', 'completed_at'])
            ->withTimestamps();
    }

    public function progressUpdates(): HasMany
    {
        return $this->hasMany(TaskProgressUpdate::class)->latest();
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function closedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'closed_by');
    }

    public function isAssignedTo(User $user): bool
    {
        return $this->assignees()->where('user_id', $user->id)->exists();
    }
}
