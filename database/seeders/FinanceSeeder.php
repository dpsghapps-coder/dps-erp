<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Department;
use App\Models\Finance\Account;
use App\Models\Finance\Asset;
use App\Models\Finance\AssetLedgerEntry;
use App\Models\Finance\Bill;
use App\Models\Finance\Invoice;
use App\Models\Finance\JournalEntry;
use App\Models\Finance\Transaction;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;

class FinanceSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::whereHas('role', fn ($q) => $q->where('name', 'admin'))->first()
            ?? User::where('email', 'admin@dps-erp.com')->first();

        if (! $admin) {
            return;
        }

        $cashAccount = Account::where('code', '1011')->first();
        $bankAccount = Account::where('code', '1021')->first();

        if (! $cashAccount || ! $bankAccount) {
            return;
        }

        $this->seedTransactions($admin, $cashAccount, $bankAccount);
        $this->seedInvoices($admin, $bankAccount);
        $this->seedBills($admin, $cashAccount);
        $this->seedAssets($admin);
    }

    private function seedTransactions(User $admin, Account $cash, Account $bank): void
    {
        if (Transaction::exists()) {
            return;
        }

        $entries = [
            ['type' => 'income', 'category' => 'Printing Services', 'amount' => 3200, 'description' => 'Bulk business card order - Tech Solutions Ghana', 'days' => -25, 'account' => $bank],
            ['type' => 'income', 'category' => 'Product Sales', 'amount' => 1850, 'description' => 'Branded apparel order', 'days' => -18, 'account' => $bank],
            ['type' => 'income', 'category' => 'Photography Services', 'amount' => 2400, 'description' => 'Studio shoot - corporate headshots', 'days' => -12, 'account' => $cash],
            ['type' => 'income', 'category' => 'Design Services', 'amount' => 600, 'description' => 'Logo design package', 'days' => -6, 'account' => $bank],
            ['type' => 'expense', 'category' => 'Materials', 'amount' => 1400, 'description' => 'Fabric and thread restock', 'days' => -20, 'account' => $bank],
            ['type' => 'expense', 'category' => 'Rent', 'amount' => 2500, 'description' => 'Monthly workshop rent', 'days' => -15, 'account' => $bank],
            ['type' => 'expense', 'category' => 'Electricity', 'amount' => 380, 'description' => 'Utility bill', 'days' => -10, 'account' => $cash],
            ['type' => 'expense', 'category' => 'Transport', 'amount' => 210, 'description' => 'Delivery fuel and logistics', 'days' => -4, 'account' => $cash],
            ['type' => 'expense', 'category' => 'Salaries', 'amount' => 8500, 'description' => 'Staff salaries - partial disbursement', 'days' => -2, 'account' => $bank],
        ];

        foreach ($entries as $e) {
            $date = now()->addDays($e['days'])->toDateString();
            $categoryAccount = Account::resolveCategoryAccount($e['category'], $e['type']);

            $lines = $e['type'] === 'income'
                ? [
                    ['account_id' => $e['account']->id, 'debit' => $e['amount'], 'credit' => 0],
                    ['account_id' => $categoryAccount->id, 'debit' => 0, 'credit' => $e['amount']],
                ]
                : [
                    ['account_id' => $categoryAccount->id, 'debit' => $e['amount'], 'credit' => 0],
                    ['account_id' => $e['account']->id, 'debit' => 0, 'credit' => $e['amount']],
                ];

            $entry = JournalEntry::post([
                'date' => $date,
                'type' => $e['type'],
                'description' => $e['description'],
                'source_module' => 'finance_transaction',
                'created_by' => $admin->id,
            ], $lines);

            Transaction::create([
                'type' => $e['type'],
                'category' => $e['category'],
                'amount' => $e['amount'],
                'description' => $e['description'],
                'date' => $date,
                'financial_account_id' => $e['account']->id,
                'journal_entry_id' => $entry->id,
                'created_by' => $admin->id,
            ]);
        }
    }

    private function seedInvoices(User $admin, Account $bank): void
    {
        if (Invoice::exists()) {
            return;
        }

        $clients = Client::orderBy('id')->take(5)->get();
        if ($clients->isEmpty()) {
            return;
        }

        $receivable = Account::resolveAccountsReceivableAccount();

        $plans = [
            ['category' => 'Printing Services', 'status' => 'draft', 'days' => -2, 'items' => [['Business cards - 1000pcs', 10, 32]]],
            ['category' => 'Product Sales', 'status' => 'sent', 'days' => -10, 'items' => [['Branded polo shirts - 50pcs', 50, 75]]],
            ['category' => 'Photography Services', 'status' => 'partially_paid', 'days' => -20, 'items' => [['Studio shoot - half day', 1, 2400]], 'paid' => 1000],
            ['category' => 'Design Services', 'status' => 'paid', 'days' => -35, 'items' => [['Logo design package', 1, 600]], 'paid' => 600],
            ['category' => 'Advertising', 'status' => 'sent', 'days' => -45, 'items' => [['Trade show booth design', 1, 1800]]],
        ];

        foreach ($plans as $i => $p) {
            $client = $clients[$i % $clients->count()];
            $invoiceDate = now()->addDays($p['days']);

            $invoice = Invoice::create([
                'invoice_number' => Invoice::generateNumber(),
                'client_id' => $client->id,
                'category' => $p['category'],
                'invoice_date' => $invoiceDate->toDateString(),
                'due_date' => $invoiceDate->copy()->addDays(14)->toDateString(),
                'status' => 'draft',
                'notes' => null,
                'created_by' => $admin->id,
            ]);

            foreach ($p['items'] as [$desc, $qty, $price]) {
                $invoice->items()->create([
                    'description' => $desc,
                    'quantity' => $qty,
                    'unit_price' => $price,
                ]);
            }

            $invoice->recalculateSubtotal();

            if ($p['status'] === 'draft') {
                continue;
            }

            $incomeAccount = Account::resolveCategoryAccount($invoice->category, 'income');
            $sendEntry = JournalEntry::post([
                'date' => $invoiceDate->toDateString(),
                'type' => 'invoice',
                'description' => "Invoice {$invoice->invoice_number} sent to {$client->company_name}",
                'source_module' => 'invoice',
                'source_id' => $invoice->id,
                'created_by' => $admin->id,
            ], [
                ['account_id' => $receivable->id, 'debit' => $invoice->subtotal, 'credit' => 0],
                ['account_id' => $incomeAccount->id, 'debit' => 0, 'credit' => $invoice->subtotal],
            ]);
            $invoice->update(['status' => 'sent', 'journal_entry_id' => $sendEntry->id]);

            if (in_array($p['status'], ['partially_paid', 'paid'], true)) {
                $amount = $p['paid'];
                $payEntry = JournalEntry::post([
                    'date' => $invoiceDate->copy()->addDays(5)->toDateString(),
                    'type' => 'invoice_payment',
                    'description' => "Payment for invoice {$invoice->invoice_number}",
                    'source_module' => 'invoice_payment',
                    'source_id' => $invoice->id,
                    'created_by' => $admin->id,
                ], [
                    ['account_id' => $bank->id, 'debit' => $amount, 'credit' => 0],
                    ['account_id' => $receivable->id, 'debit' => 0, 'credit' => $amount],
                ]);

                $invoice->payments()->create([
                    'amount' => $amount,
                    'date' => $invoiceDate->copy()->addDays(5)->toDateString(),
                    'financial_account_id' => $bank->id,
                    'reference' => 'PMT-'.$invoice->invoice_number,
                    'journal_entry_id' => $payEntry->id,
                    'created_by' => $admin->id,
                ]);

                $invoice->amount_paid = $amount;
                $invoice->status = $amount >= $invoice->subtotal - 0.005 ? 'paid' : 'partially_paid';
                $invoice->save();
            }
        }
    }

    private function seedBills(User $admin, Account $cash): void
    {
        if (Bill::exists()) {
            return;
        }

        $suppliers = Supplier::orderBy('id')->take(4)->get();
        if ($suppliers->isEmpty()) {
            return;
        }

        $payable = Account::resolveAccountsPayableAccount();

        $plans = [
            ['category' => 'Materials', 'status' => 'draft', 'days' => -3, 'items' => [['Cotton fabric restock - 200m', 200, 6.5]]],
            ['category' => 'Materials', 'status' => 'submitted', 'days' => -14, 'items' => [['Zippers and buttons', 1, 530]]],
            ['category' => 'Maintenance', 'status' => 'partially_paid', 'days' => -25, 'items' => [['Printer servicing', 1, 900]], 'paid' => 400],
            ['category' => 'Materials', 'status' => 'paid', 'days' => -40, 'items' => [['Embroidery thread set', 5, 45]], 'paid' => 225],
        ];

        foreach ($plans as $i => $p) {
            $supplier = $suppliers[$i % $suppliers->count()];
            $billDate = now()->addDays($p['days']);

            $bill = Bill::create([
                'bill_number' => 'BILL-'.now()->year.'-'.str_pad((string) ($i + 1), 4, '0', STR_PAD_LEFT),
                'supplier_id' => $supplier->id,
                'category' => $p['category'],
                'bill_date' => $billDate->toDateString(),
                'due_date' => $billDate->copy()->addDays(21)->toDateString(),
                'status' => 'draft',
                'notes' => null,
                'created_by' => $admin->id,
            ]);

            foreach ($p['items'] as [$desc, $qty, $price]) {
                $bill->items()->create([
                    'description' => $desc,
                    'quantity' => $qty,
                    'unit_price' => $price,
                ]);
            }

            $bill->subtotal = round($bill->items()->sum('line_total'), 2);
            $bill->save();

            if ($p['status'] === 'draft') {
                continue;
            }

            $expenseAccount = Account::resolveCategoryAccount($bill->category, 'expense');
            $sendEntry = JournalEntry::post([
                'date' => $billDate->toDateString(),
                'type' => 'bill',
                'description' => "Bill {$bill->bill_number} from {$supplier->company_name}",
                'source_module' => 'bill',
                'source_id' => $bill->id,
                'created_by' => $admin->id,
            ], [
                ['account_id' => $expenseAccount->id, 'debit' => $bill->subtotal, 'credit' => 0],
                ['account_id' => $payable->id, 'debit' => 0, 'credit' => $bill->subtotal],
            ]);
            $bill->update(['status' => 'submitted', 'journal_entry_id' => $sendEntry->id]);

            if (in_array($p['status'], ['partially_paid', 'paid'], true)) {
                $amount = $p['paid'];
                $payEntry = JournalEntry::post([
                    'date' => $billDate->copy()->addDays(7)->toDateString(),
                    'type' => 'bill_payment',
                    'description' => "Payment for bill {$bill->bill_number}",
                    'source_module' => 'bill_payment',
                    'source_id' => $bill->id,
                    'created_by' => $admin->id,
                ], [
                    ['account_id' => $payable->id, 'debit' => $amount, 'credit' => 0],
                    ['account_id' => $cash->id, 'debit' => 0, 'credit' => $amount],
                ]);

                $bill->payments()->create([
                    'amount' => $amount,
                    'date' => $billDate->copy()->addDays(7)->toDateString(),
                    'financial_account_id' => $cash->id,
                    'reference' => 'PMT-'.$bill->bill_number,
                    'journal_entry_id' => $payEntry->id,
                    'created_by' => $admin->id,
                ]);

                $bill->amount_paid = $amount;
                $bill->status = $amount >= $bill->subtotal - 0.005 ? 'paid' : 'partially_paid';
                $bill->save();
            }
        }
    }

    private function seedAssets(User $admin): void
    {
        if (Asset::exists()) {
            return;
        }

        $department = Department::first();

        $assets = [
            ['name' => 'Canon EOS R5 Camera', 'category' => 'Equipment', 'cost' => 12500, 'value' => 10500, 'days' => -300],
            ['name' => 'Industrial Sewing Machine', 'category' => 'Equipment', 'cost' => 8000, 'value' => 6800, 'days' => -400],
            ['name' => 'Large Format Printer', 'category' => 'Equipment', 'cost' => 18500, 'value' => 15000, 'days' => -250],
            ['name' => 'Delivery Van - Toyota Hiace', 'category' => 'Vehicle', 'cost' => 45000, 'value' => 38000, 'days' => -500],
            ['name' => 'Office Desktop Computers (x4)', 'category' => 'Equipment', 'cost' => 6000, 'value' => 4200, 'days' => -600],
        ];

        foreach ($assets as $i => $a) {
            $purchaseDate = now()->addDays($a['days']);

            $asset = Asset::create([
                'name' => $a['name'],
                'asset_tag' => 'AST-'.str_pad((string) ($i + 1), 4, '0', STR_PAD_LEFT),
                'category' => $a['category'],
                'purchase_date' => $purchaseDate->toDateString(),
                'purchase_cost' => $a['cost'],
                'current_value' => $a['value'],
                'status' => 'active',
                'location' => 'Main Workshop',
                'department_id' => $department?->id,
                'notes' => null,
                'created_by' => $admin->id,
            ]);

            AssetLedgerEntry::create([
                'asset_id' => $asset->id,
                'type' => 'depreciation',
                'amount' => round($a['cost'] - $a['value'], 2),
                'date' => now()->subDays(30)->toDateString(),
                'description' => 'Accumulated depreciation to date',
                'created_by' => $admin->id,
            ]);
        }
    }
}
