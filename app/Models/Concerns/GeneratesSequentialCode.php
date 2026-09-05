<?php

namespace App\Models\Concerns;

trait GeneratesSequentialCode
{
    protected static function nextSequentialCode(string $prefix, string $column, int $padLength = 5): string
    {
        $last = static::where($column, 'like', $prefix.'-%')
            ->orderByDesc($column)
            ->first();

        $nextNumber = $last ? ((int) substr($last->{$column}, strlen($prefix) + 1) + 1) : 1;

        return $prefix.'-'.str_pad((string) $nextNumber, $padLength, '0', STR_PAD_LEFT);
    }
}
