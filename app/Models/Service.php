<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    protected $fillable = [
        'name',
        'code',
        'description',
        'category',
        'unit',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function prices(): HasMany
    {
        return $this->hasMany(ServicePrice::class);
    }

    public function getDefaultPriceAttribute()
    {
        return $this->prices()
            ->where('min_qty', '<=', 1)
            ->orderBy('min_qty', 'desc')
            ->first()?->unit_price ?? 0;
    }

    public function getPriceForQuantity(int $quantity): ?float
    {
        $price = $this->prices()
            ->where('min_qty', '<=', $quantity)
            ->where(function ($q) use ($quantity) {
                $q->whereNull('max_qty')
                    ->orWhere('max_qty', '>=', $quantity);
            })
            ->orderBy('min_qty', 'desc')
            ->first();

        return $price?->unit_price;
    }
}

class ServicePrice extends Model
{
    protected $fillable = [
        'service_id',
        'min_qty',
        'max_qty',
        'unit_price',
    ];

    protected $casts = [
        'min_qty' => 'integer',
        'max_qty' => 'integer',
        'unit_price' => 'float',
    ];

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
