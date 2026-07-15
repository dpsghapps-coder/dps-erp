<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Decision extends Model
{
    protected $fillable = [
        'number', 'title', 'reason', 'expected_benefits',
        'priority', 'budget', 'category_id', 'approved_by',
        'meeting_id', 'agenda_id', 'status', 'created_by',
    ];

    protected $casts = [
        'budget' => 'decimal:2',
    ];

    const STATUSES = ['draft', 'proposed', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled'];

    public static function nextNumber(): string
    {
        $year = date('Y');
        $prefix = 'DEC-'.$year.'-';
        $last = static::where('number', 'like', $prefix.'%')->orderByDesc('number')->value('number');
        $next = $last ? (int) substr($last, -4) + 1 : 1;

        return $prefix.str_pad($next, 4, '0', STR_PAD_LEFT);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(DecisionCategory::class, 'category_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function meeting(): BelongsTo
    {
        return $this->belongsTo(Meeting::class);
    }

    public function agenda(): BelongsTo
    {
        return $this->belongsTo(MeetingAgenda::class, 'agenda_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function actionItems(): HasMany
    {
        return $this->hasMany(DecisionActionItem::class);
    }

    public function review(): HasOne
    {
        return $this->hasOne(DecisionReview::class);
    }

    public function attachments(): MorphMany
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }
}
