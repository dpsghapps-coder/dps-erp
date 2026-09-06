<?php

namespace App\Models\Finance;

use App\Models\Concerns\Auditable;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Bill extends Model
{
    use Auditable, SoftDeletes;

    const STATUSES = ['draft', 'submitted', 'partially_paid', 'paid', 'cancelled'];

    protected $fillable = [
        'bill_number',
        'supplier_id',
        'category',
        'bill_date',
        'due_date',
        'status',
        'subtotal',
        'amount_paid',
        'notes',
        'journal_entry_id',
        'created_by',
    ];

    protected $casts = [
        'bill_date' => 'date:Y-m-d',
        'due_date' => 'date:Y-m-d',
        'subtotal' => 'float',
        'amount_paid' => 'float',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(BillItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(BillPayment::class)->orderBy('date', 'desc');
    }

    public function journalEntry(): BelongsTo
    {
        return $this->belongsTo(JournalEntry::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getBalanceAttribute(): float
    {
        return round($this->subtotal - $this->amount_paid, 2);
    }

    public function isOverdue(): bool
    {
        return in_array($this->status, ['submitted', 'partially_paid'])
            && $this->due_date->isPast();
    }

    public function recalculateSubtotal(): void
    {
        $this->subtotal = round($this->items()->sum('line_total'), 2);
        $this->save();
    }

    public static function generateNumber(): string
    {
        $year = now()->year;
        $count = self::whereYear('created_at', $year)->count() + 1;

        return "BILL-{$year}-".str_pad((string) $count, 4, '0', STR_PAD_LEFT);
    }
}
