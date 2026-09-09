<?php

namespace App\Console\Commands;

use App\Mail\DatabaseBackupMail;
use App\Models\Setting;
use App\Support\DatabaseBackup;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class RunScheduledBackup extends Command
{
    protected $signature = 'backup:run';

    protected $description = 'Create a database backup, email it to the configured recipient if enabled, and prune old backups.';

    // Comfortably under most SMTP providers' ~25MB raw attachment cap, leaving
    // room for base64 encoding overhead (roughly +33% over the raw file size).
    private const MAX_EMAIL_ATTACHMENT_BYTES = 20 * 1024 * 1024;

    private const RETENTION_DAYS = 30;

    public function handle(): int
    {
        $path = DatabaseBackup::create();

        if (! $path) {
            $this->error('Backup failed — see the log for details.');
            Log::error('Scheduled backup failed to create a dump.');

            return self::FAILURE;
        }

        $this->info("Backup created: {$path}");

        $emailEnabled = Setting::get('backup_email_enabled') === 'true';
        $recipient = Setting::get('backup_email');

        if ($emailEnabled && $recipient) {
            $this->emailBackup($path, $recipient);
        }

        $this->pruneOldBackups();

        return self::SUCCESS;
    }

    private function emailBackup(string $path, string $recipient): void
    {
        $gzPath = $path.'.gz';

        $source = fopen($path, 'rb');
        $dest = gzopen($gzPath, 'wb9');
        while (! feof($source)) {
            gzwrite($dest, fread($source, 512 * 1024));
        }
        fclose($source);
        gzclose($dest);

        $size = filesize($gzPath);
        $tooLarge = $size > self::MAX_EMAIL_ATTACHMENT_BYTES;

        try {
            Mail::to($recipient)->send(new DatabaseBackupMail(
                attachmentPath: $tooLarge ? null : $gzPath,
                fileSizeBytes: $size,
                serverPath: $path,
            ));
            $this->info("Backup emailed to {$recipient}".($tooLarge ? ' (too large to attach — notified only)' : ''));
        } catch (\Throwable $e) {
            Log::error('Failed to email scheduled backup', ['error' => $e->getMessage()]);
            $this->error('Backup created but emailing it failed: '.$e->getMessage());
        } finally {
            @unlink($gzPath);
        }
    }

    private function pruneOldBackups(): void
    {
        $dir = storage_path('app/backups');

        if (! is_dir($dir)) {
            return;
        }

        $cutoff = now()->subDays(self::RETENTION_DAYS)->timestamp;

        foreach (scandir($dir) as $name) {
            if ($name === '.' || $name === '..') {
                continue;
            }

            $path = $dir.'/'.$name;

            if (is_file($path) && filemtime($path) < $cutoff) {
                unlink($path);
                $this->info("Pruned old backup: {$name}");
            }
        }
    }
}
