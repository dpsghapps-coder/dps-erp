<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DecisionReview extends Model
{
    protected $fillable = ['decision_id', 'rating', 'notes', 'lessons_learned', 'reviewed_by'];

    protected $casts = [
        'rating' => 'integer',
    ];

    public function decision(): BelongsTo
    {
        return $this->belongsTo(Decision::class);
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
