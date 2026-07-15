<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseRequestAttachment extends Model
{
    protected $fillable = [
        'purchase_request_item_id',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
    ];

    public function item(): BelongsTo
    {
        return $this->belongsTo(PurchaseRequestItem::class, 'purchase_request_item_id');
    }
}
