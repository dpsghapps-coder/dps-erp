<?php

namespace App\Models;

use App\Models\Concerns\GeneratesDailyCode;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseOrder extends Model
{
    use GeneratesDailyCode;

    protected $fillable = [
        'po_number',
        'supplier_id',
        'status',
        'expected_date',
        'total_amount',
        'notes',
        'receipt_path',
        'invoice_path',
        'created_by',
    ];

    protected $casts = [
        'expected_date' => 'date',
        'total_amount' => 'decimal:2',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static function generatePoNumber(): string
    {
        return static::nextDailyCode('PO', 'po_number', 3);
    }
}
