<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Http\UploadedFile;

class MarketingDocument extends Model
{
    public const MIME_RULE = 'mimes:jpg,jpeg,png,gif,pdf,doc,docx';

    public const MAX_KB = 10240;

    protected $fillable = [
        'name',
        'description',
        'campaign_id',
        'path',
        'original_filename',
        'mime_type',
        'size',
        'created_by',
    ];

    public static function createFromUpload(UploadedFile $file, array $attributes): self
    {
        $path = $file->store('marketing-documents', 'public');

        return static::create(array_merge($attributes, [
            'path' => $path,
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getClientMimeType(),
            'size' => $file->getSize(),
        ]));
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
