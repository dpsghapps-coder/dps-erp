<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseRequestItemCostItem extends Model
{
    protected $fillable = [
        'purchase_request_item_id',
        'label',
        'amount',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function purchaseRequestItem(): BelongsTo
    {
        return $this->belongsTo(PurchaseRequestItem::class);
    }
}
