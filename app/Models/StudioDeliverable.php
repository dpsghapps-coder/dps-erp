<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudioDeliverable extends Model
{
    const STATUSES = ['pending', 'in_progress', 'delivered'];

    protected $fillable = ['studio_booking_id', 'title', 'status', 'link', 'delivered_at'];

    protected $casts = [
        'status' => 'string',
        'delivered_at' => 'datetime',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(StudioBooking::class, 'studio_booking_id');
    }
}
