<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Finance\Account;
use App\Models\Finance\JournalEntry;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CashBankController extends Controller
{
    public function index()
    {
        $accounts = Account::where('type', 'asset')
            ->whereIn('subtype', ['cash', 'bank', 'mobile_money'])
            ->orderBy('code')
            ->get();

        Account::attachBalances($accounts);

        return inertia('Finance/CashBank', [
            'accounts' => $accounts,
            'totalBalance' => $accounts->sum('current_balance'),
        ]);
    }

    public function transfer(Request $request)
    {
        $validated = $request->validate([
            'from_account_id' => 'required|exists:accounts,id|different:to_account_id',
            'to_account_id' => 'required|exists:accounts,id',
            'amount' => 'required|numeric|min:0.01',
            'date' => 'required|date',
            'description' => 'nullable|string',
        ]);

        $from = Account::findOrFail($validated['from_account_id']);
        $to = Account::findOrFail($validated['to_account_id']);

        if (! $from->isCashOrBank() || ! $to->isCashOrBank()) {
            return back()->withErrors('Transfers can only be made between cash, bank, or mobile money accounts.');
        }

        $projectedFromBalance = $from->balance() - $validated['amount'];
        if ($projectedFromBalance < -0.005) {
            throw ValidationException::withMessages([
                'amount' => "This would overdraw {$from->name} to a balance of ".number_format($projectedFromBalance, 2).'.',
            ]);
        }

        JournalEntry::post([
            'date' => $validated['date'],
            'type' => 'transfer',
            'description' => $validated['description'] ?? "Transfer from {$from->name} to {$to->name}",
            'created_by' => auth()->id(),
        ], [
            ['account_id' => $to->id, 'debit' => $validated['amount'], 'credit' => 0],
            ['account_id' => $from->id, 'debit' => 0, 'credit' => $validated['amount']],
        ]);

        return back()->with('success', 'Transfer recorded successfully');
    }
}
