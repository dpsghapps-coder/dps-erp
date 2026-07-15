<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Stock extends Model
{
    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'product_id',
        'supplier_id',
        'qty_purchased',
        'price',
        'total_cost',
        'date_purchased',
        'notes',
        'added_by',
        'purchased_by',
    ];

    protected $casts = [
        'qty_purchased' => 'integer',
        'price' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'date_purchased' => 'date',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(InventoryProduct::class, 'product_id');
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function resolveRouteBinding($value, $field = null)
    {
        return $this->where('id', $value)->first();
    }
}
