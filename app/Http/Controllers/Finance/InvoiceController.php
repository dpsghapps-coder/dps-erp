<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Finance\Account;
use App\Models\Finance\Invoice;
use App\Models\Finance\JournalEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Invoice::with('client');

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $invoices = $query->orderBy('due_date')->paginate(20)->withQueryString();

        $invoices->getCollection()->transform(function (Invoice $invoice) {
            $invoice->is_overdue = $invoice->isOverdue();

            return $invoice;
        });

        $outstanding = Invoice::whereIn('status', ['sent', 'partially_paid'])->get();

        return inertia('Finance/Receivables/Index', [
            'invoices' => $invoices,
            'stats' => [
                'outstanding_total' => round($outstanding->sum(fn ($i) => $i->subtotal - $i->amount_paid), 2),
                'overdue_count' => $outstanding->filter->isOverdue()->count(),
            ],
            'filters' => $request->only('status'),
        ]);
    }

    public function create()
    {
        return inertia('Finance/Receivables/Create', [
            'clients' => Client::orderBy('company_name')->get(['id', 'company_name', 'is_greylisted']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => ['required', 'exists:clients,id', $this->notGreylistedRule()],
            'category' => 'required|string|max:100',
            'invoice_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:invoice_date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string|max:255',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        $invoice = DB::transaction(function () use ($validated) {
            $invoice = Invoice::create([
                'invoice_number' => Invoice::generateNumber(),
                'client_id' => $validated['client_id'],
                'category' => $validated['category'],
                'invoice_date' => $validated['invoice_date'],
                'due_date' => $validated['due_date'],
                'notes' => $validated['notes'] ?? null,
                'status' => 'draft',
                'created_by' => auth()->id(),
            ]);

            foreach ($validated['items'] as $item) {
                $invoice->items()->create($item);
            }

            $invoice->recalculateSubtotal();

            return $invoice;
        });

        return redirect()->route('finance.receivables.show', $invoice)->with('success', 'Invoice created as a draft');
    }

    public function show(Invoice $invoice)
    {
        $invoice->load(['client', 'items', 'payments.financialAccount', 'payments.createdBy', 'journalEntry']);
        $invoice->is_overdue = $invoice->isOverdue();

        return inertia('Finance/Receivables/Show', [
            'invoice' => $invoice,
            'financialAccounts' => $this->cashAndBankAccounts(),
        ]);
    }

    public function send(Invoice $invoice)
    {
        if ($invoice->status !== 'draft') {
            return back()->withErrors('Only a draft invoice can be sent.');
        }

        $incomeAccount = Account::resolveCategoryAccount($invoice->category, 'income');
        $receivable = Account::resolveAccountsReceivableAccount();

        $entry = JournalEntry::post([
            'date' => $invoice->invoice_date->toDateString(),
            'type' => 'invoice',
            'description' => "Invoice {$invoice->invoice_number} sent to {$invoice->client->company_name}",
            'source_module' => 'invoice',
            'source_id' => $invoice->id,
            'created_by' => auth()->id(),
        ], [
            ['account_id' => $receivable->id, 'debit' => $invoice->subtotal, 'credit' => 0],
            ['account_id' => $incomeAccount->id, 'debit' => 0, 'credit' => $invoice->subtotal],
        ]);

        $invoice->update(['status' => 'sent', 'journal_entry_id' => $entry->id]);

        return back()->with('success', 'Invoice sent and posted to the ledger');
    }

    public function storePayment(Request $request, Invoice $invoice)
    {
        if (! in_array($invoice->status, ['sent', 'partially_paid'])) {
            return back()->withErrors('Payments can only be recorded against a sent invoice.');
        }

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01', 'max:'.$invoice->balance],
            'date' => 'required|date',
            'financial_account_id' => $this->financialAccountRule(),
            'reference' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        $receivable = Account::resolveAccountsReceivableAccount();

        $entry = JournalEntry::post([
            'date' => $validated['date'],
            'type' => 'invoice_payment',
            'description' => "Payment for invoice {$invoice->invoice_number}",
            'source_module' => 'invoice_payment',
            'source_id' => $invoice->id,
            'created_by' => auth()->id(),
        ], [
            ['account_id' => $validated['financial_account_id'], 'debit' => $validated['amount'], 'credit' => 0],
            ['account_id' => $receivable->id, 'debit' => 0, 'credit' => $validated['amount']],
        ]);

        $invoice->payments()->create([
            ...$validated,
            'journal_entry_id' => $entry->id,
            'created_by' => auth()->id(),
        ]);

        $invoice->amount_paid = round($invoice->amount_paid + $validated['amount'], 2);
        $invoice->status = $invoice->amount_paid >= $invoice->subtotal - 0.005 ? 'paid' : 'partially_paid';
        $invoice->save();

        return back()->with('success', 'Payment recorded');
    }

    public function cancel(Invoice $invoice)
    {
        if ($invoice->payments()->exists()) {
            return back()->withErrors('Cannot cancel an invoice that already has payments recorded.');
        }

        $invoice->journalEntry?->reverse("Reversed: invoice {$invoice->invoice_number} cancelled");
        $invoice->update(['status' => 'cancelled']);

        return back()->with('success', 'Invoice cancelled');
    }

    public function destroy(Invoice $invoice)
    {
        if ($invoice->status !== 'draft') {
            return back()->withErrors('Only a draft invoice can be deleted. Cancel it instead.');
        }

        $invoice->delete();

        return redirect()->route('finance.receivables.index')->with('success', 'Draft invoice deleted');
    }

    private function notGreylistedRule(): \Closure
    {
        return function ($attribute, $value, $fail) {
            $client = Client::find($value);
            if ($client && $client->is_greylisted) {
                $fail('This client is greylisted and cannot be invoiced.');
            }
        };
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
