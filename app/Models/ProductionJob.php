<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductionJob extends Model
{
    const STATUS_NEW_JOBS = 'new_jobs';

    const STATUS_DESIGN = 'design';

    const STATUS_PRINTING = 'printing';

    const STATUS_ASSEMBLY = 'assembly';

    const STATUS_QC_INSPECTION = 'qc_inspection';

    const STATUS_COMPLETED = 'completed';

    const STATUS_PAUSED = 'paused';

    const STATUS_CANCELLED = 'cancelled';

    const ACTIVE_STATUSES = [
        self::STATUS_NEW_JOBS,
        self::STATUS_DESIGN,
        self::STATUS_PRINTING,
        self::STATUS_ASSEMBLY,
        self::STATUS_QC_INSPECTION,
        self::STATUS_COMPLETED,
    ];

    const TERMINAL_STATUSES = [self::STATUS_PAUSED, self::STATUS_CANCELLED];

    const ALL_STATUSES = [
        self::STATUS_NEW_JOBS,
        self::STATUS_DESIGN,
        self::STATUS_PRINTING,
        self::STATUS_ASSEMBLY,
        self::STATUS_QC_INSPECTION,
        self::STATUS_COMPLETED,
        self::STATUS_PAUSED,
        self::STATUS_CANCELLED,
    ];

    const STATUS_FLOW = [
        self::STATUS_NEW_JOBS => self::STATUS_DESIGN,
        self::STATUS_DESIGN => self::STATUS_PRINTING,
        self::STATUS_PRINTING => self::STATUS_ASSEMBLY,
        self::STATUS_ASSEMBLY => self::STATUS_QC_INSPECTION,
        self::STATUS_QC_INSPECTION => self::STATUS_COMPLETED,
    ];

    protected $fillable = [
        'job_number',
        'order_id',
        'title',
        'description',
        'status',
        'priority',
        'assigned_to',
        'started_at',
        'due_date',
        'completed_at',
    ];

    protected $casts = [
        'status' => 'string',
        'priority' => 'string',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'due_date' => 'date',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(ProductionTask::class);
    }

    public function materials(): HasMany
    {
        return $this->hasMany(ProductionMaterial::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(JobStatusHistory::class)->orderBy('created_at', 'desc');
    }

    public static function generateJobNumber(): string
    {
        $last = static::orderBy('id', 'desc')->first();
        $number = $last ? (int) substr($last->job_number, 4) + 1 : 1;

        return 'JOB-'.str_pad((string) $number, 6, '0', STR_PAD_LEFT);
    }
}

class ProductionTask extends Model
{
    protected $fillable = [
        'production_job_id',
        'title',
        'description',
        'assigned_to',
        'status',
        'due_date',
        'completed_at',
        'sort_order',
    ];

    protected $casts = [
        'status' => 'string',
        'due_date' => 'date',
        'completed_at' => 'datetime',
    ];

    public function job(): BelongsTo
    {
        return $this->belongsTo(ProductionJob::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}

class ProductionMaterial extends Model
{
    protected $fillable = [
        'production_job_id',
        'product_id',
        'required_qty',
        'consumed_qty',
    ];

    protected $casts = [
        'required_qty' => 'decimal:2',
        'consumed_qty' => 'decimal:2',
    ];

    public function job(): BelongsTo
    {
        return $this->belongsTo(ProductionJob::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
