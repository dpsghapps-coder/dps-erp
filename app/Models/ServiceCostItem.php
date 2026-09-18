<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceCostItem extends Model
{
    protected $fillable = [
        'service_id',
        'label',
        'amount',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
