<?php

namespace App\Models\Finance;

use App\Models\Concerns\Auditable;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Account extends Model
{
    use Auditable, SoftDeletes;

    const TYPES = ['asset', 'liability', 'equity', 'income', 'expense'];

    const SUBTYPES = ['cash', 'bank', 'mobile_money', 'receivable', 'inventory', 'fixed_asset', 'other'];

    const DEBIT_NORMAL_TYPES = ['asset', 'expense'];

    protected $fillable = [
        'code',
        'name',
        'type',
        'subtype',
        'parent_id',
        'description',
        'opening_balance',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'opening_balance' => 'float',
        'is_active' => 'boolean',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Account::class, 'parent_id')->orderBy('code');
    }

    public function lines(): HasMany
    {
        return $this->hasMany(JournalLine::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * The account's balance is derived entirely from posted ledger lines.
     * A non-zero `opening_balance` is realized as an actual journal entry
     * against the Opening Balance Equity account (see
     * AccountController::syncOpeningBalanceEntry()) rather than being added
     * here arithmetically — otherwise total debits would not equal total
     * credits across the ledger the moment an opening balance is set.
     */
    public function balance(): float
    {
        $debit = (float) $this->lines()->sum('debit');
        $credit = (float) $this->lines()->sum('credit');
        $movement = in_array($this->type, self::DEBIT_NORMAL_TYPES) ? $debit - $credit : $credit - $debit;

        return round($movement, 2);
    }

    /**
     * Annotate a collection of accounts with `current_balance` using a single
     * grouped query, instead of two sum() queries per account. Pass $from/$to
     * to scope the movement to a period (for a P&L) or up to a point in time
     * (for a Balance Sheet, using only $to); omit both for the all-time
     * balance used by the Chart of Accounts / Cash & Bank pages.
     */
    public static function attachBalances(Collection $accounts, ?string $from = null, ?string $to = null): Collection
    {
        $totals = JournalLine::selectRaw('journal_lines.account_id, SUM(debit) as debit, SUM(credit) as credit')
            ->join('journal_entries', 'journal_entries.id', '=', 'journal_lines.journal_entry_id')
            ->whereIn('journal_lines.account_id', $accounts->pluck('id'))
            ->when($from, fn ($q) => $q->whereDate('journal_entries.date', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('journal_entries.date', '<=', $to))
            ->groupBy('journal_lines.account_id')
            ->get()
            ->keyBy('account_id');

        $accounts->each(function (Account $account) use ($totals) {
            $row = $totals->get($account->id);
            $debit = (float) ($row->debit ?? 0);
            $credit = (float) ($row->credit ?? 0);
            $movement = in_array($account->type, self::DEBIT_NORMAL_TYPES) ? $debit - $credit : $credit - $debit;
            $account->current_balance = round($movement, 2);
        });

        return $accounts;
    }

    public static function resolveOpeningBalanceEquityAccount(): self
    {
        return self::firstOrCreate(
            ['type' => 'equity', 'name' => 'Opening Balance Equity'],
        );
    }

    public static function resolveAccountsReceivableAccount(): self
    {
        return self::firstOrCreate(
            ['type' => 'asset', 'name' => 'Accounts Receivable'],
            ['subtype' => 'receivable'],
        );
    }

    public static function resolveAccountsPayableAccount(): self
    {
        return self::firstOrCreate(
            ['type' => 'liability', 'name' => 'Accounts Payable'],
        );
    }

    public function isCashOrBank(): bool
    {
        return $this->type === 'asset' && in_array($this->subtype, ['cash', 'bank', 'mobile_money']);
    }

    /**
     * Resolve a free-text transaction category (e.g. from the quick income/
     * expense form) to a Chart of Accounts leaf account, creating one under
     * "Other Income"/"Other Expenses" if no matching account exists yet.
     */
    public static function resolveCategoryAccount(string $category, string $transactionType): self
    {
        $type = $transactionType === 'income' ? 'income' : 'expense';
        $category = trim($category);

        $existing = self::where('type', $type)
            ->whereRaw('LOWER(name) = ?', [Str::lower($category)])
            ->orderBy('id')
            ->first();
        if ($existing) {
            return $existing;
        }

        $parent = self::where('type', $type)->where('name', $type === 'income' ? 'Other Income' : 'Other Expenses')->first();

        return self::create([
            'name' => $category,
            'type' => $type,
            'parent_id' => $parent?->id,
        ]);
    }
}
