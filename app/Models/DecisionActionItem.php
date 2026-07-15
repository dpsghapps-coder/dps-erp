<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DecisionActionItem extends Model
{
    protected $fillable = [
        'decision_id', 'description', 'assigned_to', 'department',
        'start_date', 'due_date', 'priority', 'progress', 'status', 'created_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'due_date' => 'date',
        'progress' => 'integer',
    ];

    public function decision(): BelongsTo
    {
        return $this->belongsTo(Decision::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updates(): HasMany
    {
        return $this->hasMany(ActionItemUpdate::class, 'action_item_id');
    }
}
