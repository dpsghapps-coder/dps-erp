<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TrainingModule extends Model
{
    protected $fillable = [
        'title', 'description', 'video_url', 'category', 'due_date',
        'passing_score', 'sort_order', 'is_active', 'created_by',
    ];

    protected $casts = [
        'due_date' => 'date',
        'passing_score' => 'integer',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
    ];

    public function quizQuestions(): HasMany
    {
        return $this->hasMany(TrainingQuizQuestion::class)->orderBy('sort_order');
    }

    public function employeeTrainings(): HasMany
    {
        return $this->hasMany(EmployeeTraining::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
