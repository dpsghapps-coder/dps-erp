<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseOrder extends Model
{
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
        $prefix = 'PO-'.date('Ymd').'-';
        $lastPo = self::where('po_number', 'like', $prefix.'%')
            ->orderBy('po_number', 'desc')
            ->first();

        if (! $lastPo) {
            return $prefix.'001';
        }

        $lastNumber = (int) substr($lastPo->po_number, -3);
        $newNumber = str_pad($lastNumber + 1, 3, '0', STR_PAD_LEFT);

        return $prefix.$newNumber;
    }
}
