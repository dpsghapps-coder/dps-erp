<?php

namespace App\Models\Finance;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class JournalEntry extends Model
{
    protected $fillable = [
        'reference',
        'date',
        'type',
        'description',
        'source_module',
        'source_id',
        'reverses_id',
        'created_by',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
    ];

    public function lines(): HasMany
    {
        return $this->hasMany(JournalLine::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function reverses(): BelongsTo
    {
        return $this->belongsTo(JournalEntry::class, 'reverses_id');
    }

    public function reversedBy(): HasOne
    {
        return $this->hasOne(JournalEntry::class, 'reverses_id');
    }

    /**
     * Post a balanced double-entry journal entry. $lines is an array of
     * ['account_id' => int, 'debit' => float, 'credit' => float, 'description' => ?string].
     */
    public static function post(array $header, array $lines): self
    {
        $totalDebit = round(array_sum(array_column($lines, 'debit')), 2);
        $totalCredit = round(array_sum(array_column($lines, 'credit')), 2);

        if ($totalDebit !== $totalCredit) {
            throw new InvalidArgumentException('Total debits must equal total credits.');
        }

        return DB::transaction(function () use ($header, $lines) {
            $entry = self::create($header);
            $entry->reference = $entry->reference ?: 'TXN-'.str_pad((string) $entry->id, 6, '0', STR_PAD_LEFT);
            $entry->save();

            foreach ($lines as $line) {
                $entry->lines()->create($line);
            }

            return $entry;
        });
    }

    /**
     * Post a mirror-image entry that nets this entry's lines to zero, instead
     * of deleting financial history. Refuses to reverse an entry twice.
     */
    public function reverse(?string $description = null): self
    {
        if ($this->reversedBy()->exists()) {
            throw new InvalidArgumentException("Journal entry {$this->reference} has already been reversed.");
        }

        $mirroredLines = $this->lines->map(fn (JournalLine $line) => [
            'account_id' => $line->account_id,
            'debit' => $line->credit,
            'credit' => $line->debit,
            'description' => $line->description,
        ])->all();

        return self::post([
            'date' => now()->toDateString(),
            'type' => 'reversal',
            'description' => $description ?? "Reversal of {$this->reference}",
            'source_module' => $this->source_module,
            'source_id' => $this->source_id,
            'reverses_id' => $this->id,
            'created_by' => auth()->id(),
        ], $mirroredLines);
    }
}
