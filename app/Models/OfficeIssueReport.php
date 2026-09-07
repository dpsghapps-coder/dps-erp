<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OfficeIssueReport extends Model
{
    public const CATEGORIES = [
        'Harassment or Misconduct',
        'Safety Hazard',
        'Equipment or Facilities',
        'Policy Violation',
        'Management Concern',
        'Other',
    ];

    public const STATUSES = ['new', 'in_review', 'resolved', 'dismissed'];

    protected $fillable = [
        'category',
        'location',
        'description',
        'status',
        'admin_notes',
    ];
}
