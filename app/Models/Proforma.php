<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Proforma extends Model
{
    protected $fillable = [
        'client_id',
        'number',
        'date',
        'valid_until',
        'status',
        'items',
        'discount',
        'discount_type',
        'vat_rate',
        'subtotal',
        'vat_amount',
        'total',
        'deposit_rate',
        'deposit_amount',
        'balance_rate',
        'balance_amount',
        'rep_name',
        'terms',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'valid_until' => 'date',
        'items' => 'array',
        'discount' => 'decimal:2',
        'vat_rate' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'vat_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'deposit_rate' => 'decimal:2',
        'deposit_amount' => 'decimal:2',
        'balance_rate' => 'decimal:2',
        'balance_amount' => 'decimal:2',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public static function generateNumber(): string
    {
        $now = now();
        $prefix = 'DPS-v' . $now->format('dmy');
        $last = static::where('number', 'like', $prefix . '%')->latest('id')->first();

        if ($last) {
            $seq = (int) substr($last->number, -3) + 1;
        } else {
            $seq = 1;
        }

        return $prefix . '-' . str_pad($seq, 3, '0', STR_PAD_LEFT);
    }

    public static function calculate(array $data): array
    {
        $items = collect($data['items'] ?? []);
        $subtotal = $items->sum(fn($item) => ($item['quantity'] ?? 0) * ($item['unit_cost'] ?? 0));

        $discountType = $data['discount_type'] ?? 'flat';
        $discountValue = (float) ($data['discount'] ?? 0);
        $discounted = $discountType === 'percentage'
            ? $subtotal - ($subtotal * $discountValue / 100)
            : $subtotal - $discountValue;

        $vatRate = (float) ($data['vat_rate'] ?? 20);
        $vatAmount = $discounted * $vatRate / 100;
        $total = $discounted + $vatAmount;

        $depositRate = (float) ($data['deposit_rate'] ?? 70);
        $balanceRate = 100 - $depositRate;
        $depositAmount = $total * $depositRate / 100;
        $balanceAmount = $total * $balanceRate / 100;

        return [
            'subtotal' => round($subtotal, 2),
            'discount' => round($discountValue, 2),
            'vat_rate' => round($vatRate, 2),
            'vat_amount' => round($vatAmount, 2),
            'total' => round($total, 2),
            'deposit_rate' => round($depositRate, 2),
            'deposit_amount' => round($depositAmount, 2),
            'balance_rate' => round($balanceRate, 2),
            'balance_amount' => round($balanceAmount, 2),
        ];
    }
}
