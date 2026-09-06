<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use App\Models\Concerns\GeneratesDailyCode;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Collection;

class Order extends Model
{
    use Auditable, GeneratesDailyCode;

    const STATUS_DRAFT = 'draft';

    const STATUS_CONFIRMED = 'confirmed';

    const STATUS_PAYMENT_RECEIVED = 'payment_received';

    const STATUS_IN_PRODUCTION = 'in_production';

    const STATUS_READY = 'ready';

    const STATUS_DELIVERED = 'delivered';

    const STATUS_CANCELLED = 'cancelled';

    const STATUS_TRANSITIONS = [
        self::STATUS_DRAFT => [self::STATUS_CONFIRMED, self::STATUS_CANCELLED],
        self::STATUS_CONFIRMED => [self::STATUS_PAYMENT_RECEIVED, self::STATUS_CANCELLED],
        self::STATUS_PAYMENT_RECEIVED => [self::STATUS_IN_PRODUCTION, self::STATUS_CANCELLED],
        self::STATUS_IN_PRODUCTION => [self::STATUS_READY, self::STATUS_CANCELLED],
        self::STATUS_READY => [self::STATUS_DELIVERED, self::STATUS_CANCELLED],
        self::STATUS_DELIVERED => [],
        self::STATUS_CANCELLED => [],
    ];

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

    public function payments(): HasMany
    {
        return $this->hasMany(OrderPayment::class);
    }

    public function getTotalPaidAttribute(): float
    {
        return (float) $this->payments->sum('amount');
    }

    public function getPaymentBalanceAttribute(): float
    {
        return max(0, (float) $this->grand_total - $this->total_paid);
    }

    public function productionJobs(): HasMany
    {
        return $this->hasMany(ProductionJob::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)->orderBy('created_at', 'desc');
    }

    public function calculateTotals(): void
    {
        $this->total_amount = $this->items->sum(fn ($item) => $item->qty * $item->unit_price);
        $this->discount_amount = $this->items->sum(fn ($item) => $item->qty * $item->unit_price * ($item->discount_pct / 100));
        $this->tax_amount = 0;
        $this->grand_total = $this->total_amount - $this->discount_amount + $this->tax_amount;
        $this->save();
    }

    public static function generateOrderNumber(): string
    {
        return static::nextDailyCode('ORD', 'order_number', 3);
    }

    public function canTransitionTo(string $status): bool
    {
        return in_array($status, self::STATUS_TRANSITIONS[$this->status] ?? [], true);
    }

    public function transitionTo(string $status, ?string $notes = null): bool
    {
        if (! $this->canTransitionTo($status)) {
            return false;
        }

        $oldStatus = $this->status;
        $this->update(['status' => $status]);

        $this->statusHistory()->create([
            'old_status' => $oldStatus,
            'new_status' => $status,
            'changed_by' => auth()->id(),
            'notes' => $notes,
        ]);

        return true;
    }

    public function isEditable(): bool
    {
        return $this->status === self::STATUS_DRAFT;
    }

    public function materialRequirements(): Collection
    {
        $this->loadMissing('items.product.components');

        return $this->items
            ->filter(fn (OrderItem $item) => $item->product_type === Product::class && $item->product)
            ->flatMap(function (OrderItem $item) {
                return $item->product->components
                    ->filter(fn (ProductComponent $component) => $component->component_type === InventoryProduct::class)
                    ->map(fn (ProductComponent $component) => [
                        'material_id' => $component->component_id,
                        'required_qty' => (float) $component->quantity * (float) $item->qty,
                    ]);
            })
            ->groupBy('material_id')
            ->map(fn ($rows) => $rows->sum('required_qty'));
    }

    public function syncStatusWithProduction(): void
    {
        $jobs = $this->productionJobs()->whereNotIn('status', [ProductionJob::STATUS_CANCELLED])->get();

        if ($jobs->isEmpty()) {
            return;
        }

        if ($jobs->every(fn (ProductionJob $job) => $job->status === ProductionJob::STATUS_COMPLETED)) {
            $this->transitionTo(self::STATUS_READY, 'All linked production jobs completed');

            return;
        }

        if ($jobs->contains(fn (ProductionJob $job) => $job->status !== ProductionJob::STATUS_NEW_JOBS)) {
            $this->transitionTo(self::STATUS_IN_PRODUCTION, 'A linked production job started');
        }
    }
}

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'product_id',
        'product_type',
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

    public function product(): MorphTo
    {
        return $this->morphTo();
    }

    protected static function booted()
    {
        static::saving(function ($item) {
            $item->line_total = $item->qty * $item->unit_price * (1 - $item->discount_pct / 100);
        });
    }
}
