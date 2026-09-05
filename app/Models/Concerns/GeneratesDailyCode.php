<?php

namespace App\Models\Concerns;

trait GeneratesDailyCode
{
    protected static function nextDailyCode(string $prefix, string $column, int $padLength = 3): string
    {
        $todayPrefix = $prefix.'-'.now()->format('Ymd').'-';

        $last = static::where($column, 'like', $todayPrefix.'%')
            ->orderByDesc($column)
            ->first();

        $nextNumber = $last ? ((int) substr($last->{$column}, -$padLength) + 1) : 1;

        return $todayPrefix.str_pad((string) $nextNumber, $padLength, '0', STR_PAD_LEFT);
    }
}
