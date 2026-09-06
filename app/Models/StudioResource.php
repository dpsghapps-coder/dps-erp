<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudioResource extends Model
{
    protected $fillable = ['name', 'type', 'description', 'is_available'];

    protected $casts = [
        'type' => 'string',
        'is_available' => 'boolean',
    ];
}
