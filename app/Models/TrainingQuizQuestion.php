<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingQuizQuestion extends Model
{
    protected $fillable = [
        'training_module_id', 'question', 'options', 'correct_option', 'sort_order',
    ];

    protected $casts = [
        'options' => 'array',
        'correct_option' => 'integer',
        'sort_order' => 'integer',
    ];

    public function trainingModule(): BelongsTo
    {
        return $this->belongsTo(TrainingModule::class);
    }
}
