<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payroll extends Model
{
    protected $fillable = [
        'employee_id',
        'month',
        'basic_salary',
        'allowances',
        'overtime',
        'bonuses',
        'deductions_tax',
        'deductions_insurance',
        'deductions_retirement',
        'deductions_other',
        'gross_pay',
        'net_pay',
        'status',
        'payment_date',
    ];

    protected $casts = [
        'basic_salary' => 'decimal:2',
        'allowances' => 'decimal:2',
        'overtime' => 'decimal:2',
        'bonuses' => 'decimal:2',
        'deductions_tax' => 'decimal:2',
        'deductions_insurance' => 'decimal:2',
        'deductions_retirement' => 'decimal:2',
        'deductions_other' => 'decimal:2',
        'gross_pay' => 'decimal:2',
        'net_pay' => 'decimal:2',
        'payment_date' => 'date',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
