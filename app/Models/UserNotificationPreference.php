<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserNotificationPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'procurement',
        'orders',
        'inventory',
        'hrm',
        'chat_messages',
    ];

    protected $casts = [
        'procurement' => 'boolean',
        'orders' => 'boolean',
        'inventory' => 'boolean',
        'hrm' => 'boolean',
        'chat_messages' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function getForUser(int $userId): self
    {
        return static::firstOrCreate(['user_id' => $userId]);
    }
}
