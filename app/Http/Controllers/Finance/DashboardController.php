<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Finance\Account;
use App\Models\Finance\Asset;
use App\Models\Finance\Transaction;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $cashAccounts = Account::where('type', 'asset')
            ->whereIn('subtype', ['cash', 'bank', 'mobile_money'])
            ->get();
        Account::attachBalances($cashAccounts);

        $cashBalance = $cashAccounts->where('subtype', 'cash')->sum('current_balance');
        $bankBalance = $cashAccounts->where('subtype', 'bank')->sum('current_balance');
        $mobileMoneyBalance = $cashAccounts->where('subtype', 'mobile_money')->sum('current_balance');

        $assetAccounts = Account::where('type', 'asset')->get();
        Account::attachBalances($assetAccounts);
        $ledgerAssetsTotal = $assetAccounts->sum('current_balance');
        $trackedAssetsTotal = (float) Asset::where('status', '!=', 'disposed')->sum('current_value');
        $totalAssets = $ledgerAssetsTotal + $trackedAssetsTotal;

        $now = Carbon::now();
        $incomeThisMonth = Transaction::income()->thisMonth()->sum('amount');
        $expenseThisMonth = Transaction::expense()->thisMonth()->sum('amount');
        $netProfit = $incomeThisMonth - $expenseThisMonth;

        $recentTransactions = Transaction::with('financialAccount')
            ->orderBy('date', 'desc')
            ->orderBy('id', 'desc')
            ->limit(8)
            ->get();

        $months = collect(range(5, 0))->map(fn ($i) => $now->copy()->subMonths($i));
        $incomeVsExpense = $months->map(function (Carbon $month) {
            return [
                'name' => $month->format('M'),
                'income' => (float) Transaction::income()
                    ->whereMonth('date', $month->month)->whereYear('date', $month->year)
                    ->sum('amount'),
                'expense' => (float) Transaction::expense()
                    ->whereMonth('date', $month->month)->whereYear('date', $month->year)
                    ->sum('amount'),
            ];
        });

        $expenseBreakdown = Transaction::expense()->thisMonth()
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => ['name' => $row->category, 'value' => (float) $row->total]);

        $revenueByCategory = Transaction::income()->thisMonth()
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => ['name' => $row->category, 'value' => (float) $row->total]);

        return inertia('Finance/Dashboard', [
            'indicators' => [
                'cash_balance' => $cashBalance,
                'bank_balance' => $bankBalance,
                'mobile_money_balance' => $mobileMoneyBalance,
                'total_assets' => $totalAssets,
                'income_this_month' => $incomeThisMonth,
                'expense_this_month' => $expenseThisMonth,
                'net_profit' => $netProfit,
            ],
            'recentTransactions' => $recentTransactions,
            'incomeVsExpense' => $incomeVsExpense,
            'expenseBreakdown' => $expenseBreakdown,
            'revenueByCategory' => $revenueByCategory,
        ]);
    }
}
