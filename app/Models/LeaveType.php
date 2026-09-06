<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveType extends Model
{
    const TYPES = ['Annual', 'Sick', 'Emergency'];

    protected $fillable = ['name', 'staff_level_id', 'days_per_year'];

    public function staffLevel(): BelongsTo
    {
        return $this->belongsTo(StaffLevel::class);
    }
}
