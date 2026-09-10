<?php

namespace App\Rules;

use App\Models\Client;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Accepts either a local Ghana number (0XXXXXXXXX) or an international
 * number starting with + (e.g. +86 195 8476 1373).
 */
class PhoneNumber implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (preg_match(Client::PHONE_REGEX, $value) || preg_match(Client::INTERNATIONAL_PHONE_REGEX, $value)) {
            return;
        }

        $fail('The :attribute must be a Ghana number (0XXXXXXXXX) or an international number starting with +.');
    }
}
