<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'order_number',
        'client_id',
        'contact_id',
        'status',
        'total_amount',
        'discount_amount',
        'tax_amount',
        'grand_total',
        'currency',
        'payment_status',
        'delivery_date',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'status' => 'string',
        'payment_status' => 'string',
        'delivery_date' => 'date',
        'total_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'grand_total' => 'decimal:2',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function productionJobs(): HasMany
    {
        return $this->hasMany(ProductionJob::class);
    }

    public function calculateTotals(): void
    {
        $this->total_amount = $this->items->sum('line_total');
        $this->discount_amount = $this->items->sum(fn ($item) => $item->qty * $item->unit_price * ($item->discount_pct / 100));
        $this->tax_amount = 0;
        $this->grand_total = $this->total_amount - $this->discount_amount + $this->tax_amount;
        $this->save();
    }

    public static function generateOrderNumber(): string
    {
        $last = static::orderBy('id', 'desc')->first();
        $number = $last ? (int) substr($last->order_number, 4) + 1 : 1;

        return 'ORD-'.str_pad((string) $number, 6, '0', STR_PAD_LEFT);
    }
}

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'product_id',
        'description',
        'qty',
        'unit_price',
        'discount_pct',
        'line_total',
    ];

    protected $casts = [
        'qty' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'discount_pct' => 'decimal:2',
        'line_total' => 'decimal:2',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    protected static function booted()
    {
        static::saving(function ($item) {
            $item->line_total = $item->qty * $item->unit_price * (1 - $item->discount_pct / 100);
        });
    }
}
