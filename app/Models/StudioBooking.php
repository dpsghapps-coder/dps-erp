<?php

namespace App\Models;

use App\Models\Concerns\GeneratesDailyCode;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class StudioBooking extends Model
{
    use GeneratesDailyCode;

    protected $fillable = [
        'booking_reference',
        'order_id',
        'client_id',
        'title',
        'description',
        'status',
        'start_datetime',
        'end_datetime',
        'created_by',
        'notes',
    ];

    protected $casts = [
        'status' => 'string',
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function resources(): BelongsToMany
    {
        return $this->belongsToMany(StudioResource::class, 'studio_booking_resources');
    }

    public function crew(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'studio_crew')->withPivot('role_in_shoot');
    }

    public static function generateBookingReference(): string
    {
        return static::nextDailyCode('BK', 'booking_reference', 3);
    }
}
