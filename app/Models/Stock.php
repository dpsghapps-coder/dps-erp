<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Stock extends Model
{
    use Auditable, SoftDeletes;

    protected $keyType = 'string';

    public $incrementing = false;

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Stock $stock) {
            if (empty($stock->id)) {
                $stock->id = (string) Str::uuid();
            }
        });
    }

    protected $fillable = [
        'id',
        'product_id',
        'supplier_id',
        'purchase_order_id',
        'purchase_order_item_id',
        'units_purchased',
        'qty_per_unit',
        'qty_purchased',
        'material_cost',
        'price',
        'total_cost',
        'date_purchased',
        'notes',
        'added_by',
        'purchased_by',
    ];

    protected $casts = [
        'units_purchased' => 'decimal:2',
        'qty_per_unit' => 'decimal:2',
        'qty_purchased' => 'decimal:2',
        'material_cost' => 'decimal:2',
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

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function purchaseOrderItem(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrderItem::class);
    }

    /**
     * True when a Stock record already exists for this exact PO line item --
     * use this to guard against pulling the same item into stock twice,
     * whether via the bulk pull-to-stock action or the per-item picker.
     */
    public static function alreadyPulledFor(PurchaseOrderItem $item): bool
    {
        return static::where('purchase_order_item_id', $item->id)->exists();
    }

    /**
     * Build (but don't save) a Stock record from a received PurchaseOrderItem,
     * so a PO's items can be pulled straight into stock instead of re-keying
     * the same quantities and costs by hand. $qty overrides the item's own
     * qty (e.g. an inspected/accepted quantity that differs from what was
     * ordered); defaults to the item's full qty when omitted.
     */
    public static function fromPurchaseOrderItem(PurchaseOrderItem $item, PurchaseOrder $po, ?float $qty = null): self
    {
        $qty = $qty ?? (float) $item->qty;
        $materialCost = $qty * (float) $item->unit_cost;
        $userName = auth()->user()?->name ?? auth()->user()?->email;

        return new self([
            'product_id' => $item->product_id,
            'supplier_id' => $po->supplier_id,
            'purchase_order_id' => $po->id,
            'purchase_order_item_id' => $item->id,
            'units_purchased' => 1,
            'qty_per_unit' => $qty,
            'qty_purchased' => $qty,
            'material_cost' => $materialCost,
            'total_cost' => $materialCost,
            'price' => $qty > 0 ? round($materialCost / $qty, 2) : 0,
            'date_purchased' => now()->toDateString(),
            'notes' => "Pulled from PO {$po->po_number}",
            'added_by' => $userName,
            'purchased_by' => $userName,
        ]);
    }

    public function costItems(): HasMany
    {
        return $this->hasMany(StockCostItem::class);
    }

    public function resolveRouteBinding($value, $field = null)
    {
        return $this->where('id', $value)->first();
    }
}
