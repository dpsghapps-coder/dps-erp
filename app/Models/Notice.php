<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notice extends Model
{
    protected $fillable = [
        'title',
        'content',
        'type',
        'posted_by',
        'is_pinned',
        'event_date',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'event_date' => 'date',
    ];

    public function postedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'posted_by');
    }
}
