<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

$tables = DB::select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");

foreach ($tables as $table) {
    $name = $table->name;
    echo "\n=== TABLE: $name ===\n";
    
    // Get columns
    $columns = DB::select("PRAGMA table_info('$name')");
    foreach ($columns as $col) {
        $parts = [$col->name, $col->type];
        if ($col->notnull) $parts[] = 'NOT NULL';
        if ($col->dflt_value !== null) $parts[] = "DEFAULT " . $col->dflt_value;
        if ($col->pk) $parts[] = 'PRIMARY KEY';
        echo "  " . implode(' ', $parts) . ";\n";
    }
    
    // Get indexes
    $indexes = DB::select("PRAGMA index_list('$name')");
    foreach ($indexes as $idx) {
        if ($idx->unique) {
            $info = DB::select("PRAGMA index_info('{$idx->name}')");
            $cols = array_map(fn($i) => $i->name, $info);
            echo "  UNIQUE INDEX {$idx->name} (" . implode(', ', $cols) . ");\n";
        }
    }
    
    // Get foreign keys
    $fks = DB::select("PRAGMA foreign_key_list('$name')");
    foreach ($fks as $fk) {
        echo "  FOREIGN KEY ({$fk->from}) REFERENCES {$fk->table}({$fk->to});\n";
    }
}
