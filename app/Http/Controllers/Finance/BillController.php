<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Finance\Account;
use App\Models\Finance\Bill;
use App\Models\Finance\JournalEntry;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BillController extends Controller
{
    public function index(Request $request)
    {
        $query = Bill::with('supplier');

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $bills = $query->orderBy('due_date')->paginate(20)->withQueryString();

        $bills->getCollection()->transform(function (Bill $bill) {
            $bill->is_overdue = $bill->isOverdue();

            return $bill;
        });

        $outstanding = Bill::whereIn('status', ['submitted', 'partially_paid'])->get();

        return inertia('Finance/Payables/Index', [
            'bills' => $bills,
            'stats' => [
                'outstanding_total' => round($outstanding->sum(fn ($b) => $b->subtotal - $b->amount_paid), 2),
                'overdue_count' => $outstanding->filter->isOverdue()->count(),
            ],
            'filters' => $request->only('status'),
        ]);
    }

    public function create()
    {
        return inertia('Finance/Payables/Create', [
            'suppliers' => Supplier::where('is_active', true)->orderBy('company_name')->get(['id', 'company_name']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'category' => 'required|string|max:100',
            'bill_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:bill_date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string|max:255',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        $bill = DB::transaction(function () use ($validated) {
            $bill = Bill::create([
                'bill_number' => Bill::generateNumber(),
                'supplier_id' => $validated['supplier_id'],
                'category' => $validated['category'],
                'bill_date' => $validated['bill_date'],
                'due_date' => $validated['due_date'],
                'notes' => $validated['notes'] ?? null,
                'status' => 'draft',
                'created_by' => auth()->id(),
            ]);

            foreach ($validated['items'] as $item) {
                $bill->items()->create($item);
            }

            $bill->recalculateSubtotal();

            return $bill;
        });

        return redirect()->route('finance.payables.show', $bill)->with('success', 'Bill created as a draft');
    }

    public function show(Bill $bill)
    {
        $bill->load(['supplier', 'items', 'payments.financialAccount', 'payments.createdBy', 'journalEntry']);
        $bill->is_overdue = $bill->isOverdue();

        return inertia('Finance/Payables/Show', [
            'bill' => $bill,
            'financialAccounts' => $this->cashAndBankAccounts(),
        ]);
    }

    public function submit(Bill $bill)
    {
        if ($bill->status !== 'draft') {
            return back()->withErrors('Only a draft bill can be submitted.');
        }

        $expenseAccount = Account::resolveCategoryAccount($bill->category, 'expense');
        $payable = Account::resolveAccountsPayableAccount();

        $entry = JournalEntry::post([
            'date' => $bill->bill_date->toDateString(),
            'type' => 'bill',
            'description' => "Bill {$bill->bill_number} from {$bill->supplier->company_name}",
            'source_module' => 'bill',
            'source_id' => $bill->id,
            'created_by' => auth()->id(),
        ], [
            ['account_id' => $expenseAccount->id, 'debit' => $bill->subtotal, 'credit' => 0],
            ['account_id' => $payable->id, 'debit' => 0, 'credit' => $bill->subtotal],
        ]);

        $bill->update(['status' => 'submitted', 'journal_entry_id' => $entry->id]);

        return back()->with('success', 'Bill submitted and posted to the ledger');
    }

    public function storePayment(Request $request, Bill $bill)
    {
        if (! in_array($bill->status, ['submitted', 'partially_paid'])) {
            return back()->withErrors('Payments can only be recorded against a submitted bill.');
        }

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01', 'max:'.$bill->balance],
            'date' => 'required|date',
            'financial_account_id' => $this->financialAccountRule(),
            'reference' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        $account = Account::find($validated['financial_account_id']);
        $this->assertSufficientFunds($account, $account->balance() - $validated['amount']);

        $payable = Account::resolveAccountsPayableAccount();

        $entry = JournalEntry::post([
            'date' => $validated['date'],
            'type' => 'bill_payment',
            'description' => "Payment for bill {$bill->bill_number}",
            'source_module' => 'bill_payment',
            'source_id' => $bill->id,
            'created_by' => auth()->id(),
        ], [
            ['account_id' => $payable->id, 'debit' => $validated['amount'], 'credit' => 0],
            ['account_id' => $validated['financial_account_id'], 'debit' => 0, 'credit' => $validated['amount']],
        ]);

        $bill->payments()->create([
            ...$validated,
            'journal_entry_id' => $entry->id,
            'created_by' => auth()->id(),
        ]);

        $bill->amount_paid = round($bill->amount_paid + $validated['amount'], 2);
        $bill->status = $bill->amount_paid >= $bill->subtotal - 0.005 ? 'paid' : 'partially_paid';
        $bill->save();

        return back()->with('success', 'Payment recorded');
    }

    public function cancel(Bill $bill)
    {
        if ($bill->payments()->exists()) {
            return back()->withErrors('Cannot cancel a bill that already has payments recorded.');
        }

        $bill->journalEntry?->reverse("Reversed: bill {$bill->bill_number} cancelled");
        $bill->update(['status' => 'cancelled']);

        return back()->with('success', 'Bill cancelled');
    }

    public function destroy(Bill $bill)
    {
        if ($bill->status !== 'draft') {
            return back()->withErrors('Only a draft bill can be deleted. Cancel it instead.');
        }

        $bill->delete();

        return redirect()->route('finance.payables.index')->with('success', 'Draft bill deleted');
    }

    private function assertSufficientFunds(Account $account, float $projectedBalance): void
    {
        if ($projectedBalance < -0.005) {
            throw ValidationException::withMessages([
                'amount' => "This would overdraw {$account->name} to a balance of ".number_format($projectedBalance, 2).'.',
            ]);
        }
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
}
