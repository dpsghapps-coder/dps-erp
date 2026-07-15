<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Performance extends Model
{
    protected $fillable = [
        'employee_id',
        'review_date',
        'rating',
        'goals',
        'achievements',
        'comments',
        'reviewer_name',
        'status',
    ];

    protected $casts = [
        'review_date' => 'date',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
