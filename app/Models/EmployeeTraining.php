<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeTraining extends Model
{
    public const STATUSES = ['completed', 'failed'];

    protected $fillable = [
        'training_module_id', 'user_id', 'status', 'quiz_score', 'attempts', 'completed_at',
    ];

    protected $casts = [
        'quiz_score' => 'integer',
        'attempts' => 'integer',
        'completed_at' => 'datetime',
    ];

    public function trainingModule(): BelongsTo
    {
        return $this->belongsTo(TrainingModule::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
