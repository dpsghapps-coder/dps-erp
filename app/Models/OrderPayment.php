<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderPayment extends Model
{
    const METHOD_LABELS = [
        'cash' => 'Cash',
        'mobile_money' => 'Mobile Money',
        'cheque' => 'Cheque',
        'bank_transfer' => 'Bank Transfer',
        'apps_mobile' => 'Apps & Mobile',
    ];

    const MOBILE_MONEY_PROVIDER_LABELS = [
        'mtn_momo' => 'MTN MOMO',
        'telecash' => 'Telecash',
        'at_money' => 'AT Money',
    ];

    protected $fillable = [
        'order_id',
        'payment_method',
        'mobile_money_provider',
        'amount',
        'recorded_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
