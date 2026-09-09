<?php

namespace App\Support;

use Illuminate\Support\Facades\Log;

class DatabaseBackup
{
    /**
     * Create a full database dump (mysqldump for MySQL, file copy for
     * SQLite) under storage/app/backups. Returns the absolute path on
     * success, null on failure (with the reason logged).
     */
    public static function create(): ?string
    {
        $connection = config('database.default');
        $backupDir = storage_path('app/backups');

        if (! is_dir($backupDir)) {
            mkdir($backupDir, 0755, true);
        }

        $isSqlite = $connection === 'sqlite';
        $backupPath = $backupDir.'/database-'.now()->format('Y-m-d_His').($isSqlite ? '.sqlite' : '.sql');

        $ok = $isSqlite
            ? copy(config('database.connections.sqlite.database'), $backupPath)
            : self::dumpMysql($connection, $backupPath);

        return $ok ? $backupPath : null;
    }

    private static function dumpMysql(string $connection, string $backupPath): bool
    {
        $config = config("database.connections.$connection");
        $mysqldump = env('DB_MYSQLDUMP_PATH', 'mysqldump');

        // Password passed via MYSQL_PWD rather than --password= so it doesn't
        // show up in the process list while the dump is running.
        $command = sprintf(
            '%s --user=%s --host=%s --port=%s %s > %s 2>&1',
            escapeshellarg($mysqldump),
            escapeshellarg($config['username']),
            escapeshellarg($config['host']),
            escapeshellarg((string) $config['port']),
            escapeshellarg($config['database']),
            escapeshellarg($backupPath)
        );

        putenv('MYSQL_PWD='.$config['password']);
        exec($command, $output, $exitCode);
        putenv('MYSQL_PWD');

        if ($exitCode !== 0 || ! file_exists($backupPath) || filesize($backupPath) === 0) {
            Log::error('mysqldump backup failed', ['output' => implode("\n", $output), 'exit_code' => $exitCode]);

            return false;
        }

        return true;
    }
}
