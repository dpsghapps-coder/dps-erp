<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class StudioResource extends Model
{
    const TYPES = ['studio_room', 'camera', 'lighting', 'prop', 'vehicle'];

    protected $fillable = ['name', 'type', 'description', 'is_available'];

    protected $casts = [
        'type' => 'string',
        'is_available' => 'boolean',
    ];

    public function bookings(): BelongsToMany
    {
        return $this->belongsToMany(StudioBooking::class, 'studio_booking_resources');
    }
}
