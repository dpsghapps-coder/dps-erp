<?php

namespace App\Http\Controllers;

use App\Models\Finance\Account;
use App\Models\Finance\JournalEntry;
use App\Models\Finance\Transaction;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class FinanceController extends Controller
{
    public function index()
    {
        $transactions = Transaction::with(['createdBy', 'financialAccount'])
            ->orderBy('date', 'desc')
            ->paginate(25);

        $totalIncome = Transaction::income()->thisMonth()->sum('amount');
        $totalExpense = Transaction::expense()->thisMonth()->sum('amount');
        $balance = $totalIncome - $totalExpense;

        return inertia('Finance/Index', [
            'transactions' => $transactions,
            'stats' => [
                'total_income' => $totalIncome,
                'total_expense' => $totalExpense,
                'balance' => $balance,
            ],
        ]);
    }

    public function create()
    {
        return inertia('Finance/Create', [
            'financialAccounts' => $this->cashAndBankAccounts(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:income,expense',
            'category' => 'required|string|max:100',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string',
            'date' => 'required|date',
            'reference' => 'nullable|string|max:100',
            'financial_account_id' => $this->financialAccountRule(),
        ]);

        if ($validated['type'] === 'expense') {
            $account = Account::find($validated['financial_account_id']);
            $this->assertSufficientFunds($account, $account->balance() - $validated['amount']);
        }

        $validated['created_by'] = auth()->id();
        $validated['journal_entry_id'] = $this->postToLedger($validated)->id;

        Transaction::create($validated);

        return redirect()->route('finance.index')->with('success', 'Transaction created successfully');
    }

    public function show(Transaction $transaction)
    {
        $transaction->load(['createdBy', 'financialAccount', 'journalEntry.lines.account']);

        return inertia('Finance/Show', ['transaction' => $transaction]);
    }

    public function edit(Transaction $transaction)
    {
        return inertia('Finance/Edit', [
            'transaction' => $transaction,
            'financialAccounts' => $this->cashAndBankAccounts(),
        ]);
    }

    public function update(Request $request, Transaction $transaction)
    {
        $validated = $request->validate([
            'type' => 'required|in:income,expense',
            'category' => 'required|string|max:100',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string',
            'date' => 'required|date',
            'reference' => 'nullable|string|max:100',
            'financial_account_id' => $this->financialAccountRule(),
        ]);

        $this->assertEditWouldNotOverdraw($transaction, $validated);

        $oldJournalEntry = $transaction->journalEntry;
        $validated['journal_entry_id'] = $this->postToLedger($validated)->id;

        $transaction->update($validated);
        $oldJournalEntry?->reverse('Reversed: transaction edited');

        return redirect()->route('finance.index')->with('success', 'Transaction updated successfully');
    }

    public function destroy(Transaction $transaction)
    {
        $transaction->journalEntry?->reverse('Reversed: transaction deleted');
        $transaction->delete();

        return redirect()->route('finance.index')->with('success', 'Transaction deleted successfully');
    }

    private function financialAccountRule(): array
    {
        return [
            'required',
            'exists:accounts,id',
            function ($attribute, $value, $fail) {
                $account = Account::find($value);
                if (! $account || ! $account->isCashOrBank()) {
                    $fail('The financial account must be a cash, bank, or mobile money account.');
                }
            },
        ];
    }

    private function cashAndBankAccounts()
    {
        return Account::where('type', 'asset')
            ->whereIn('subtype', ['cash', 'bank', 'mobile_money'])
            ->orderBy('code')
            ->get();
    }

    private function assertSufficientFunds(Account $account, float $projectedBalance): void
    {
        if ($projectedBalance < -0.005) {
            throw ValidationException::withMessages([
                'amount' => "This would overdraw {$account->name} to a balance of ".number_format($projectedBalance, 2).'.',
            ]);
        }
    }

    /**
     * Editing a transaction effectively removes its old effect on its
     * financial account and applies the new one. Check both sides so an
     * edit can't silently push either account negative.
     */
    private function assertEditWouldNotOverdraw(Transaction $transaction, array $validated): void
    {
        $oldAccount = $transaction->financial_account_id ? Account::find($transaction->financial_account_id) : null;
        $oldEffect = $transaction->type === 'expense' ? -$transaction->amount : $transaction->amount;
        $newAccount = Account::find($validated['financial_account_id']);
        $newEffect = $validated['type'] === 'expense' ? -$validated['amount'] : $validated['amount'];

        if ($oldAccount && $newAccount && $oldAccount->id === $newAccount->id) {
            $this->assertSufficientFunds($newAccount, $newAccount->balance() - $oldEffect + $newEffect);

            return;
        }

        if ($oldAccount && $oldEffect > 0) {
            $this->assertSufficientFunds($oldAccount, $oldAccount->balance() - $oldEffect);
        }

        if ($newEffect < 0) {
            $this->assertSufficientFunds($newAccount, $newAccount->balance() + $newEffect);
        }
    }

    private function postToLedger(array $validated): JournalEntry
    {
        $categoryAccount = Account::resolveCategoryAccount($validated['category'], $validated['type']);
        $financialAccountId = $validated['financial_account_id'];

        $lines = $validated['type'] === 'income'
            ? [
                ['account_id' => $financialAccountId, 'debit' => $validated['amount'], 'credit' => 0],
                ['account_id' => $categoryAccount->id, 'debit' => 0, 'credit' => $validated['amount']],
            ]
            : [
                ['account_id' => $categoryAccount->id, 'debit' => $validated['amount'], 'credit' => 0],
                ['account_id' => $financialAccountId, 'debit' => 0, 'credit' => $validated['amount']],
            ];

        return JournalEntry::post([
            'date' => $validated['date'],
            'type' => $validated['type'],
            'description' => $validated['description'] ?? $validated['category'],
            'source_module' => 'finance_transaction',
            'created_by' => auth()->id(),
        ], $lines);
    }
}
