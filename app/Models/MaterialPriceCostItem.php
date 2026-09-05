<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaterialPriceCostItem extends Model
{
    protected $fillable = [
        'material_price_id',
        'label',
        'amount',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function materialPrice(): BelongsTo
    {
        return $this->belongsTo(MaterialPrice::class);
    }
}
