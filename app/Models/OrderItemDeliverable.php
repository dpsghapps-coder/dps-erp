<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItemDeliverable extends Model
{
    public const STATUSES = ['pending', 'in_progress', 'delivered'];

    protected $fillable = [
        'order_item_id', 'description', 'qty_promised', 'qty_delivered', 'status', 'notes',
    ];

    protected $casts = [
        'qty_promised' => 'integer',
        'qty_delivered' => 'integer',
    ];

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }
}
