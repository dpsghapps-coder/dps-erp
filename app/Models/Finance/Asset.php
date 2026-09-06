<?php

namespace App\Models\Finance;

use App\Models\Concerns\Auditable;
use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Asset extends Model
{
    use Auditable, SoftDeletes;

    const STATUSES = ['active', 'under_maintenance', 'disposed'];

    protected $fillable = [
        'name',
        'asset_tag',
        'category',
        'purchase_date',
        'purchase_cost',
        'current_value',
        'status',
        'location',
        'department_id',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'purchase_date' => 'date:Y-m-d',
        'purchase_cost' => 'float',
        'current_value' => 'float',
    ];

    public function ledgerEntries(): HasMany
    {
        return $this->hasMany(AssetLedgerEntry::class)->orderBy('date', 'desc')->orderBy('id', 'desc');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
