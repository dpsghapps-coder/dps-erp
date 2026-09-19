<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Http\UploadedFile;

class ProposalFile extends Model
{
    public const MIME_RULE = 'mimes:doc,docx,pdf,xls,xlsx';

    public const MAX_KB = 20480;

    protected $fillable = [
        'proposal_id',
        'original_filename',
        'path',
        'mime_type',
        'size',
        'uploaded_by',
    ];

    public static function createFromUpload(UploadedFile $file, array $attributes): self
    {
        $path = $file->store('proposal-files', 'public');

        return static::create(array_merge($attributes, [
            'path' => $path,
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getClientMimeType(),
            'size' => $file->getSize(),
        ]));
    }

    public function proposal(): BelongsTo
    {
        return $this->belongsTo(Proposal::class);
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
