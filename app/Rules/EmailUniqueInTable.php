<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\DB;

/**
 * Checks an email isn't already used by a *different* row in another table.
 * Used to keep users.email and employees.email cross-table unique, since
 * the two are kept in sync (see User/Employee model email sync).
 */
class EmailUniqueInTable implements ValidationRule
{
    public function __construct(
        private readonly string $table,
        private readonly ?int $ignoreId = null,
    ) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $query = DB::table($this->table)->where('email', $value);

        if ($this->ignoreId !== null) {
            $query->where('id', '!=', $this->ignoreId);
        }

        if ($query->exists()) {
            $fail('The :attribute has already been taken.');
        }
    }
}
