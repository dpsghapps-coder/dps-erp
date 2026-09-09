<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Setting;
use App\Support\DatabaseBackup;
use Illuminate\Http\Request;

class BackupController extends Controller
{
    public function index()
    {
        return inertia('Admin/Backups', [
            'backups' => $this->listBackups(),
            'emailEnabled' => Setting::get('backup_email_enabled') === 'true',
            'email' => Setting::get('backup_email'),
        ]);
    }

    public function store(Request $request)
    {
        $path = DatabaseBackup::create();

        if (! $path) {
            return back()->withErrors(['backup' => 'Backup failed. Check the server logs for details.']);
        }

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'database_backup_created',
            'new_values' => ['backup_path' => $path],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', 'Backup created.');
    }

    public function download(string $filename)
    {
        $path = $this->resolvePath($filename);
        abort_unless($path, 404);

        return response()->download($path);
    }

    public function destroy(Request $request, string $filename)
    {
        $path = $this->resolvePath($filename);
        abort_unless($path, 404);

        unlink($path);

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'database_backup_deleted',
            'old_values' => ['backup_path' => $path],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', 'Backup deleted.');
    }

    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'backup_email_enabled' => 'required|boolean',
            'backup_email' => 'nullable|required_if:backup_email_enabled,true|email|max:255',
        ]);

        Setting::set('backup_email_enabled', $validated['backup_email_enabled'] ? 'true' : 'false');
        Setting::set('backup_email', $validated['backup_email'] ?? '');

        return back()->with('success', 'Backup settings saved.');
    }

    private function listBackups(): array
    {
        $dir = storage_path('app/backups');
        $files = [];

        if (is_dir($dir)) {
            foreach (scandir($dir) as $name) {
                if ($name === '.' || $name === '..') {
                    continue;
                }
                $path = $dir.'/'.$name;
                if (! is_file($path)) {
                    continue;
                }
                $files[] = [
                    'name' => $name,
                    'size' => filesize($path),
                    'created_at' => date('c', filemtime($path)),
                ];
            }
        }

        usort($files, fn ($a, $b) => strcmp($b['created_at'], $a['created_at']));

        return $files;
    }

    /**
     * Resolve a requested filename to an actual path inside the backups
     * directory only — basename() strips any directory traversal, so the
     * recombined path can never escape the backups directory.
     */
    private function resolvePath(string $filename): ?string
    {
        $safeName = basename($filename);
        $path = storage_path('app/backups/'.$safeName);

        return file_exists($path) ? $path : null;
    }
}
