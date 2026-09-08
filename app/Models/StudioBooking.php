<?php

namespace App\Models;

use App\Models\Concerns\GeneratesDailyCode;
use App\Models\Finance\Invoice;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudioBooking extends Model
{
    use GeneratesDailyCode;

    protected $fillable = [
        'booking_reference',
        'order_id',
        'invoice_id',
        'client_id',
        'shoot_type_id',
        'title',
        'description',
        'status',
        'start_datetime',
        'end_datetime',
        'created_by',
        'notes',
        'rate',
        'deposit_amount',
        'deposit_paid',
    ];

    protected $casts = [
        'status' => 'string',
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
        'rate' => 'decimal:2',
        'deposit_amount' => 'decimal:2',
        'deposit_paid' => 'boolean',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    public function shootType(): BelongsTo
    {
        return $this->belongsTo(StudioShootType::class, 'shoot_type_id');
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

    public function deliverables(): HasMany
    {
        return $this->hasMany(StudioDeliverable::class);
    }

    public static function generateBookingReference(): string
    {
        return static::nextDailyCode('BK', 'booking_reference', 3);
    }
}
