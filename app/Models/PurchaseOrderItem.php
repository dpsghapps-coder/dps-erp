<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseOrderItem extends Model
{
    protected $fillable = [
        'purchase_order_id',
        'product_id',
        'description',
        'qty',
        'unit_cost',
        'line_total',
        'received_qty',
        'inspection_status',
        'inspection_notes',
        'accepted_qty',
    ];

    protected $casts = [
        'qty' => 'decimal:2',
        'unit_cost' => 'decimal:2',
        'line_total' => 'decimal:2',
        'received_qty' => 'decimal:2',
        'accepted_qty' => 'decimal:2',
    ];

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function product(): BelongsTo
    {
        // Note: Controller uses products table, but inventory system uses inventory_products.
        // I will link it to InventoryProduct as it's more appropriate for procurement.
        return $this->belongsTo(InventoryProduct::class, 'product_id');
    }
}
