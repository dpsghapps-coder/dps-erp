<?php

namespace App\Http\Controllers;

use App\Models\Finance\Transaction;
use Illuminate\Http\Request;

class FinanceController extends Controller
{
    public function index()
    {
        $transactions = Transaction::with('createdBy')
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
        return inertia('Finance/Create');
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
        ]);

        $validated['created_by'] = auth()->id();

        Transaction::create($validated);

        return redirect()->route('finance.index')->with('success', 'Transaction created successfully');
    }

    public function show(Transaction $transaction)
    {
        $transaction->load('createdBy');

        return inertia('Finance/Show', ['transaction' => $transaction]);
    }

    public function edit(Transaction $transaction)
    {
        return inertia('Finance/Edit', ['transaction' => $transaction]);
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
        ]);

        $transaction->update($validated);

        return redirect()->route('finance.index')->with('success', 'Transaction updated successfully');
    }

    public function destroy(Transaction $transaction)
    {
        $transaction->delete();

        return redirect()->route('finance.index')->with('success', 'Transaction deleted successfully');
    }
}
