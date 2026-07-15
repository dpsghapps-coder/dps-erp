<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseRequestItem extends Model
{
    protected $fillable = [
        'purchase_request_id',
        'item_name',
        'item_description',
        'product_id',
        'estimated_cost',
        'qty_requested',
        'uom',
    ];

    protected $casts = [
        'estimated_cost' => 'decimal:2',
        'qty_requested' => 'decimal:2',
    ];

    public function purchaseRequest(): BelongsTo
    {
        return $this->belongsTo(PurchaseRequest::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(InventoryProduct::class, 'product_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(PurchaseRequestAttachment::class, 'purchase_request_item_id');
    }
}
