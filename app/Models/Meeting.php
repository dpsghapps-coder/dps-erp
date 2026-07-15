<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Meeting extends Model
{
    protected $fillable = [
        'number', 'title', 'type', 'date', 'time', 'venue',
        'organizer_id', 'chairperson_id', 'secretary_id',
        'notes', 'status', 'created_by',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public static function nextNumber(): string
    {
        $year = date('Y');
        $prefix = 'MTG-'.$year.'-';
        $last = static::where('number', 'like', $prefix.'%')->orderByDesc('number')->value('number');
        $next = $last ? (int) substr($last, -4) + 1 : 1;

        return $prefix.str_pad($next, 4, '0', STR_PAD_LEFT);
    }

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    public function chairperson(): BelongsTo
    {
        return $this->belongsTo(User::class, 'chairperson_id');
    }

    public function secretary(): BelongsTo
    {
        return $this->belongsTo(User::class, 'secretary_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function attendees(): HasMany
    {
        return $this->hasMany(MeetingAttendee::class);
    }

    public function agendas(): HasMany
    {
        return $this->hasMany(MeetingAgenda::class)->orderBy('position');
    }

    public function decisions(): HasMany
    {
        return $this->hasMany(Decision::class);
    }
}
