<?php

namespace App\Models;

use App\Models\Concerns\GeneratesDailyCode;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseRequest extends Model
{
    use GeneratesDailyCode;

    protected $fillable = [
        'pr_number',
        'job_id',
        'job_number',
        'request_date',
        'requester_id',
        'department',
        'priority',
        'required_by_date',
        'purpose',
        'status',
        'dept_manager_id',
        'dept_manager_comment',
        'finance_user_id',
        'finance_comment',
        'supplier_id',
        'postpone_until',
        'purchase_order_id',
        'created_by',
    ];

    protected $casts = [
        'request_date' => 'date',
        'required_by_date' => 'date',
        'postpone_until' => 'date',
    ];

    protected static function booted(): void
    {
        static::creating(function (PurchaseRequest $pr) {
            if (empty($pr->pr_number)) {
                $pr->pr_number = static::generatePrNumber();
            }
            if (empty($pr->created_by)) {
                $pr->created_by = auth()->id();
            }
        });
    }

    public static function generatePrNumber(): string
    {
        return static::nextDailyCode('PR', 'pr_number', 3);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function departmentManager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dept_manager_id');
    }

    public function financeUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'finance_user_id');
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseRequestItem::class);
    }

    public function history(): HasMany
    {
        return $this->hasMany(PurchaseRequestHistory::class);
    }

    public function scopeForRequester($query, $userId)
    {
        return $query->where('requester_id', $userId);
    }

    public function scopeForDepartment($query, $department)
    {
        return $query->where('department', $department);
    }

    public function scopePendingFinance($query)
    {
        return $query->where('status', 'dept_approved');
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'draft' => 'gray',
            'pending' => 'yellow',
            'dept_approved' => 'blue',
            'finance_approved' => 'green',
            'rejected' => 'red',
            'queried' => 'orange',
            'held' => 'purple',
            'po_created' => 'emerald',
            'cancelled' => 'red',
            default => 'gray',
        };
    }
}
