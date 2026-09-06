<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Finance\Account;
use App\Models\Finance\JournalEntry;
use Closure;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    public function index()
    {
        $accounts = Account::orderBy('code')->get();
        Account::attachBalances($accounts);

        return inertia('Finance/Accounts', [
            'accounts' => $accounts,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'nullable|string|max:50|unique:accounts,code',
            'name' => ['required', 'string', 'max:255', $this->uniqueNameRule($request)],
            'type' => 'required|in:'.implode(',', Account::TYPES),
            'subtype' => 'nullable|in:'.implode(',', Account::SUBTYPES),
            'parent_id' => ['nullable', 'exists:accounts,id', $this->parentTypeRule($request)],
            'description' => 'nullable|string',
            'opening_balance' => 'nullable|numeric',
        ]);

        $validated['created_by'] = auth()->id();

        $account = Account::create($validated);
        $this->syncOpeningBalanceEntry($account);

        return back()->with('success', 'Account created successfully');
    }

    public function update(Request $request, Account $account)
    {
        $validated = $request->validate([
            'code' => 'nullable|string|max:50|unique:accounts,code,'.$account->id,
            'name' => ['required', 'string', 'max:255', $this->uniqueNameRule($request, $account)],
            'type' => 'required|in:'.implode(',', Account::TYPES),
            'subtype' => 'nullable|in:'.implode(',', Account::SUBTYPES),
            'parent_id' => ['nullable', 'exists:accounts,id', 'not_in:'.$account->id, $this->parentTypeRule($request)],
            'description' => 'nullable|string',
            'opening_balance' => 'nullable|numeric',
            'is_active' => 'boolean',
        ]);

        $openingBalanceChanged = round((float) $account->opening_balance, 2) !== round((float) ($validated['opening_balance'] ?? 0), 2);

        $account->update($validated);

        if ($openingBalanceChanged) {
            $this->syncOpeningBalanceEntry($account);
        }

        return back()->with('success', 'Account updated successfully');
    }

    public function destroy(Account $account)
    {
        if ($account->children()->exists()) {
            return back()->withErrors('Cannot delete an account that has sub-accounts.');
        }

        if ($account->lines()->exists()) {
            return back()->withErrors('Cannot delete an account with ledger history. Deactivate it instead.');
        }

        $account->delete();

        return back()->with('success', 'Account deleted successfully');
    }

    /**
     * Realize an account's declared opening balance as a real, balanced
     * journal entry against "Opening Balance Equity" instead of an
     * arithmetic-only field, so total debits always equal total credits
     * across the ledger (see Account::balance()).
     */
    private function syncOpeningBalanceEntry(Account $account): void
    {
        if ($account->type === 'equity' && $account->name === 'Opening Balance Equity') {
            return;
        }

        JournalEntry::where('source_module', 'account_opening_balance')
            ->where('source_id', $account->id)
            ->get()
            ->each(fn (JournalEntry $entry) => $entry->delete());

        if (abs($account->opening_balance) < 0.005) {
            return;
        }

        $equity = Account::resolveOpeningBalanceEquityAccount();
        $amount = round(abs($account->opening_balance), 2);
        $isDebitNormal = in_array($account->type, Account::DEBIT_NORMAL_TYPES);
        $accountIsDebited = ($isDebitNormal && $account->opening_balance > 0) || (! $isDebitNormal && $account->opening_balance < 0);

        $lines = $accountIsDebited
            ? [
                ['account_id' => $account->id, 'debit' => $amount, 'credit' => 0],
                ['account_id' => $equity->id, 'debit' => 0, 'credit' => $amount],
            ]
            : [
                ['account_id' => $account->id, 'debit' => 0, 'credit' => $amount],
                ['account_id' => $equity->id, 'debit' => $amount, 'credit' => 0],
            ];

        JournalEntry::post([
            'date' => now()->toDateString(),
            'type' => 'opening_balance',
            'description' => 'Opening balance for '.$account->name,
            'source_module' => 'account_opening_balance',
            'source_id' => $account->id,
            'created_by' => auth()->id(),
        ], $lines);
    }

    private function parentTypeRule(Request $request): Closure
    {
        return function ($attribute, $value, $fail) use ($request) {
            if (! $value) {
                return;
            }

            $parent = Account::find($value);
            if ($parent && $parent->type !== $request->input('type')) {
                $fail('The parent account must be of the same type ('.$parent->type.').');
            }
        };
    }

    private function uniqueNameRule(Request $request, ?Account $ignore = null): Closure
    {
        return function ($attribute, $value, $fail) use ($request, $ignore) {
            $exists = Account::where('type', $request->input('type'))
                ->whereRaw('LOWER(name) = ?', [strtolower(trim($value))])
                ->when($ignore, fn ($q) => $q->where('id', '!=', $ignore->id))
                ->exists();

            if ($exists) {
                $fail('An account of this type with this name already exists.');
            }
        };
    }
}
