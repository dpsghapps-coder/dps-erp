<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DatabaseBackupMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly ?string $attachmentPath,
        public readonly int $fileSizeBytes,
        public readonly string $serverPath,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Database Backup — '.config('app.name').' — '.now()->format('Y-m-d'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.backup',
            with: [
                'sizeHuman' => $this->formatBytes($this->fileSizeBytes),
                'attached' => $this->attachmentPath !== null,
                'serverPath' => $this->serverPath,
            ],
        );
    }

    public function attachments(): array
    {
        if (! $this->attachmentPath) {
            return [];
        }

        return [
            Attachment::fromPath($this->attachmentPath)
                ->as('database-backup-'.now()->format('Y-m-d').'.sql.gz')
                ->withMime('application/gzip'),
        ];
    }

    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        $size = $bytes;

        while ($size >= 1024 && $i < count($units) - 1) {
            $size /= 1024;
            $i++;
        }

        return round($size, 1).' '.$units[$i];
    }
}
