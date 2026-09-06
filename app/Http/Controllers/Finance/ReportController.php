<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Finance\Account;
use App\Models\Finance\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index()
    {
        return inertia('Finance/Reports/Index');
    }

    public function profitLoss(Request $request)
    {
        $from = $request->from ?: Carbon::now()->startOfMonth()->toDateString();
        $to = $request->to ?: Carbon::now()->toDateString();

        $incomeAccounts = Account::where('type', 'income')->orderBy('code')->get();
        Account::attachBalances($incomeAccounts, $from, $to);
        $incomeAccounts = $incomeAccounts->filter(fn ($a) => abs($a->current_balance) > 0.005)->values();

        $expenseAccounts = Account::where('type', 'expense')->orderBy('code')->get();
        Account::attachBalances($expenseAccounts, $from, $to);
        $expenseAccounts = $expenseAccounts->filter(fn ($a) => abs($a->current_balance) > 0.005)->values();

        $totalIncome = round($incomeAccounts->sum('current_balance'), 2);
        $totalExpense = round($expenseAccounts->sum('current_balance'), 2);

        return inertia('Finance/Reports/ProfitLoss', [
            'incomeAccounts' => $incomeAccounts,
            'expenseAccounts' => $expenseAccounts,
            'totalIncome' => $totalIncome,
            'totalExpense' => $totalExpense,
            'netProfit' => round($totalIncome - $totalExpense, 2),
            'filters' => ['from' => $from, 'to' => $to],
        ]);
    }

    public function balanceSheet(Request $request)
    {
        $asOf = $request->as_of ?: Carbon::now()->toDateString();

        $assetAccounts = Account::where('type', 'asset')->orderBy('code')->get();
        Account::attachBalances($assetAccounts, null, $asOf);
        $assetAccounts = $assetAccounts->filter(fn ($a) => abs($a->current_balance) > 0.005)->values();

        $liabilityAccounts = Account::where('type', 'liability')->orderBy('code')->get();
        Account::attachBalances($liabilityAccounts, null, $asOf);
        $liabilityAccounts = $liabilityAccounts->filter(fn ($a) => abs($a->current_balance) > 0.005)->values();

        $equityAccounts = Account::where('type', 'equity')->orderBy('code')->get();
        Account::attachBalances($equityAccounts, null, $asOf);
        $equityAccounts = $equityAccounts->filter(fn ($a) => abs($a->current_balance) > 0.005)->values();

        // Books are never "closed" into Retained Earnings here, so the sheet
        // only balances (Assets = Liabilities + Equity) if unclosed net
        // income/expense is folded into Equity as its own line.
        $incomeAccounts = Account::where('type', 'income')->get();
        Account::attachBalances($incomeAccounts, null, $asOf);
        $expenseAccounts = Account::where('type', 'expense')->get();
        Account::attachBalances($expenseAccounts, null, $asOf);
        $netIncomeUnclosed = round($incomeAccounts->sum('current_balance') - $expenseAccounts->sum('current_balance'), 2);

        $totalAssets = round($assetAccounts->sum('current_balance'), 2);
        $totalLiabilities = round($liabilityAccounts->sum('current_balance'), 2);
        $totalEquity = round($equityAccounts->sum('current_balance') + $netIncomeUnclosed, 2);

        return inertia('Finance/Reports/BalanceSheet', [
            'assetAccounts' => $assetAccounts,
            'liabilityAccounts' => $liabilityAccounts,
            'equityAccounts' => $equityAccounts,
            'netIncomeUnclosed' => $netIncomeUnclosed,
            'totalAssets' => $totalAssets,
            'totalLiabilities' => $totalLiabilities,
            'totalEquity' => $totalEquity,
            'filters' => ['as_of' => $asOf],
        ]);
    }

    public function transactions(Request $request)
    {
        $query = Transaction::with(['financialAccount', 'createdBy']);

        if ($request->from) {
            $query->whereDate('date', '>=', $request->from);
        }
        if ($request->to) {
            $query->whereDate('date', '<=', $request->to);
        }
        if ($request->type && $request->type !== 'all') {
            $query->where('type', $request->type);
        }
        if ($request->category) {
            $query->where('category', 'like', '%'.$request->category.'%');
        }
        if ($request->financial_account_id) {
            $query->where('financial_account_id', $request->financial_account_id);
        }

        $transactions = $query->orderBy('date', 'desc')->orderBy('id', 'desc')->paginate(25)->withQueryString();

        return inertia('Finance/Reports/Transactions', [
            'transactions' => $transactions,
            'financialAccounts' => Account::where('type', 'asset')->whereIn('subtype', ['cash', 'bank', 'mobile_money'])->orderBy('code')->get(),
            'filters' => $request->only(['from', 'to', 'type', 'category', 'financial_account_id']),
        ]);
    }
}
