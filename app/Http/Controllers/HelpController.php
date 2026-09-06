<?php

namespace App\Http\Controllers;

class HelpController extends Controller
{
    public function index()
    {
        return view('help.index', ['articles' => collect($this->articles())]);
    }

    public function show(string $slug)
    {
        $article = collect($this->articles())->firstWhere('slug', $slug);

        abort_if(! $article, 404);

        return view('help.show', ['article' => $article]);
    }

    /**
     * Annotated-screenshot help articles, grouped by module. Add a new entry
     * here (with its screenshot(s) in public/images/help/) to document
     * another page.
     */
    private function articles(): array
    {
        return [
            [
                'slug' => 'crm-clients',
                'module' => 'CRM',
                'title' => 'Clients & Accounts',
                'summary' => 'Browse, search, and manage every customer account.',
                'screenshots' => [
                    [
                        'image' => 'crm-clients-accounts.jpg',
                        'caption' => 'The Clients & Accounts list',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Add Client', 'text' => 'Opens the form to create a new client record.'],
                            ['n' => 2, 'title' => 'Search', 'text' => 'Filters the list live as you type a company name.'],
                            ['n' => 3, 'title' => 'Tier filter', 'text' => 'Show only Bronze, Silver, Gold, or Platinum clients.'],
                            ['n' => 4, 'title' => 'A-Z jump list', 'text' => 'Jump straight to companies starting with a given letter.'],
                            ['n' => 5, 'title' => 'Client card', 'text' => 'Company name, industry, primary contact, and location at a glance.'],
                            ['n' => 6, 'title' => 'Start Sale Campaign', 'text' => 'Quick-launches a marketing campaign targeted at this client. Only appears for eligible clients.'],
                            ['n' => 7, 'title' => 'Edit / Delete', 'text' => 'Edit the client\'s details, or remove the record.'],
                        ],
                    ],
                    [
                        'image' => 'crm-add-client-form.jpg',
                        'caption' => 'Adding a new client',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Company Name', 'text' => 'The only required field — everything else can be filled in later.'],
                            ['n' => 2, 'title' => 'Industry', 'text' => 'Free text, used for filtering and reporting later.'],
                            ['n' => 3, 'title' => 'Email', 'text' => 'Used for sending invoices, quotes, and marketing campaigns.'],
                            ['n' => 4, 'title' => 'Phone', 'text' => 'Must be 10 digits starting with 0 (local format).'],
                            ['n' => 5, 'title' => 'Address', 'text' => 'Street address — City, Country, and GPS Location are separate fields below it.'],
                        ],
                    ],
                ],
                'tips' => [
                    'A client can be greylisted elsewhere in the CRM — a greylisted client cannot be invoiced from Finance until the flag is cleared.',
                    'The tier badge (Bronze/Silver/Gold/Platinum) is informational and can be used to prioritise follow-ups.',
                ],
            ],
            [
                'slug' => 'finance-chart-of-accounts',
                'module' => 'Finance',
                'title' => 'Chart of Accounts',
                'summary' => 'The full list of accounts — assets, liabilities, equity, income, and expenses — everything else in Finance is built on this.',
                'screenshots' => [
                    [
                        'image' => 'chart-of-accounts-list.jpg',
                        'caption' => 'The Chart of Accounts list',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Add Account', 'text' => 'Opens the form to create a new account. Rarely needed — most categories resolve automatically.'],
                            ['n' => 2, 'title' => 'Code', 'text' => '1000s = Assets, 2000s = Liabilities, 3000s = Equity, 4000s = Income, 5000s = Expenses.'],
                            ['n' => 3, 'title' => 'Name', 'text' => 'Indented to show the parent/child hierarchy — e.g. Main Cash sits under Cash, under Assets.'],
                            ['n' => 4, 'title' => 'Balance', 'text' => 'The account\'s current balance, computed live from every ledger entry ever posted to it.'],
                            ['n' => 5, 'title' => 'Edit / Delete', 'text' => 'An account with ledger history can\'t be deleted — deactivate it instead.'],
                        ],
                    ],
                    [
                        'image' => 'chart-of-accounts-form.jpg',
                        'caption' => 'Adding a new account',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Code', 'text' => 'Optional, but follow the numbering pattern so it sorts sensibly.'],
                            ['n' => 2, 'title' => 'Name', 'text' => 'Required. Must be unique within the same Type.'],
                            ['n' => 3, 'title' => 'Type', 'text' => 'One of the five buckets: Asset, Liability, Equity, Income, or Expense.'],
                            ['n' => 4, 'title' => 'Subtype', 'text' => 'For asset accounts only — mark Cash, Bank, or Mobile Money so it shows up correctly in Cash & Bank.'],
                            ['n' => 5, 'title' => 'Parent Account', 'text' => 'Must be the same Type as the account you\'re creating.'],
                            ['n' => 6, 'title' => 'Opening Balance', 'text' => 'Posts a real balancing entry against Opening Balance Equity — it isn\'t just a display number.'],
                            ['n' => 7, 'title' => 'Description', 'text' => 'Optional notes for anyone else who opens this account later.'],
                            ['n' => 8, 'title' => 'Save Account', 'text' => 'Creates the account immediately — there\'s no draft state here.'],
                        ],
                    ],
                ],
                'tips' => [
                    'You will rarely need this screen day-to-day — typing a category name on the Transactions screen finds or creates the matching account for you.',
                    'See the full Bookkeeping Field Manual for what these accounts mean and how debits and credits work.',
                ],
            ],
            [
                'slug' => 'finance-dashboard',
                'module' => 'Finance',
                'title' => 'Finance Dashboard',
                'summary' => 'A high-level view of cash, income, expenses, and assets — the first thing to check each morning.',
                'screenshots' => [
                    [
                        'image' => 'finance-dashboard.jpg',
                        'caption' => 'The Finance Dashboard',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Cash Balance', 'text' => 'Live total sitting in your physical cash drawer accounts.'],
                            ['n' => 2, 'title' => 'Total Assets', 'text' => 'Cash + bank + mobile money + everything else the business owns.'],
                            ['n' => 3, 'title' => 'Net Profit', 'text' => 'Income minus expenses for the current month.'],
                            ['n' => 4, 'title' => 'Accounts Receivable', 'text' => 'Coming soon on this card — the live figure is on the Receivables page.'],
                            ['n' => 5, 'title' => 'Income vs Expenses', 'text' => 'A month-by-month trend so you can spot a bad month early.'],
                            ['n' => 6, 'title' => 'Expense Breakdown', 'text' => 'Where the money actually goes, by category, for the current month.'],
                        ],
                    ],
                ],
                'tips' => [
                    'Every figure here is computed live from the ledger — nothing on this page is manually entered.',
                ],
            ],
            [
                'slug' => 'finance-transactions',
                'module' => 'Finance',
                'title' => 'Transactions',
                'summary' => 'Quick day-to-day income and expense logging — the fastest way to record a sale or a purchase.',
                'screenshots' => [
                    [
                        'image' => 'finance-transactions-list.jpg',
                        'caption' => 'The Transactions list',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Add Transaction', 'text' => 'Opens the form to record a new income or expense.'],
                            ['n' => 2, 'title' => 'Income / Expense / Balance', 'text' => 'Running totals for everything logged here.'],
                            ['n' => 3, 'title' => 'Search', 'text' => 'Filters the list live by description or reference.'],
                            ['n' => 4, 'title' => 'Type filter', 'text' => 'Show only Income or only Expense entries.'],
                            ['n' => 5, 'title' => 'Transaction table', 'text' => 'Date, category, account, description, reference, and amount for every entry.'],
                        ],
                    ],
                    [
                        'image' => 'finance-transaction-form.jpg',
                        'caption' => 'Adding a transaction',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Type', 'text' => 'Income or Expense — decides which side of the ledger this posts to.'],
                            ['n' => 2, 'title' => 'Category', 'text' => 'Type a name — it matches an existing account or creates one automatically.'],
                            ['n' => 3, 'title' => 'Amount', 'text' => 'The value of this transaction.'],
                            ['n' => 4, 'title' => 'Date', 'text' => 'Defaults to today, but can be backdated.'],
                            ['n' => 5, 'title' => 'Financial Account', 'text' => 'Which cash, bank, or mobile money account the money moved through.'],
                            ['n' => 6, 'title' => 'Description', 'text' => 'Optional free text — helpful when reviewing the ledger later.'],
                            ['n' => 7, 'title' => 'Reference', 'text' => 'Optional invoice or receipt number for cross-checking.'],
                            ['n' => 8, 'title' => 'Save Transaction', 'text' => 'Posts a real balanced entry to the General Ledger immediately.'],
                        ],
                    ],
                ],
                'tips' => [
                    'This is the fastest path for everyday bookkeeping — most businesses never need to touch the Chart of Accounts directly.',
                ],
            ],
            [
                'slug' => 'finance-cash-bank',
                'module' => 'Finance',
                'title' => 'Cash & Bank',
                'summary' => 'Every cash drawer, bank account, and mobile money wallet, with running balances and transfers between them.',
                'screenshots' => [
                    [
                        'image' => 'cash-bank-list.jpg',
                        'caption' => 'The Cash & Bank list',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Transfer Funds', 'text' => 'Move money between two of your own accounts — e.g. cash to bank.'],
                            ['n' => 2, 'title' => 'Total Balance', 'text' => 'Sum of every cash, bank, and mobile money account combined.'],
                            ['n' => 3, 'title' => 'Account card', 'text' => 'Each card is one physical account, with its live balance.'],
                        ],
                    ],
                    [
                        'image' => 'cash-bank-transfer-form.jpg',
                        'caption' => 'Transferring funds between accounts',
                        'callouts' => [
                            ['n' => 1, 'title' => 'From Account', 'text' => 'Where the money is coming out of.'],
                            ['n' => 2, 'title' => 'To Account', 'text' => 'Where it\'s going.'],
                            ['n' => 3, 'title' => 'Amount', 'text' => 'Blocked if it would take the From account negative.'],
                            ['n' => 4, 'title' => 'Date', 'text' => 'Defaults to today.'],
                            ['n' => 5, 'title' => 'Transfer', 'text' => 'Posts two balanced ledger entries — money out of one account, into the other.'],
                        ],
                    ],
                ],
                'tips' => [
                    'A transfer never touches income or expenses — it just moves money between your own accounts, so it has no effect on Profit & Loss.',
                    'The system will not let a transfer or transaction take a cash/bank account negative.',
                ],
            ],
            [
                'slug' => 'finance-receivables',
                'module' => 'Finance',
                'title' => 'Accounts Receivable',
                'summary' => 'Invoices and money owed to you by customers — draft, send, and collect payment.',
                'screenshots' => [
                    [
                        'image' => 'receivables-list.jpg',
                        'caption' => 'The Receivables list',
                        'callouts' => [
                            ['n' => 1, 'title' => 'New Invoice', 'text' => 'Starts a new invoice as a draft — nothing posts to the ledger yet.'],
                            ['n' => 2, 'title' => 'Total Outstanding', 'text' => 'Everything still owed to you across every unpaid invoice.'],
                            ['n' => 3, 'title' => 'Overdue Invoices', 'text' => 'Sent invoices past their due date with a balance remaining.'],
                            ['n' => 4, 'title' => 'Status filter', 'text' => 'Jump straight to draft, sent, partially paid, paid, or cancelled invoices.'],
                            ['n' => 5, 'title' => 'Invoice row', 'text' => 'Client, due date, total, paid so far, remaining balance, and status.'],
                        ],
                    ],
                    [
                        'image' => 'receivables-invoice-form.jpg',
                        'caption' => 'Creating a new invoice',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Client', 'text' => 'A greylisted client cannot be invoiced until the flag is cleared.'],
                            ['n' => 2, 'title' => 'Income Category', 'text' => 'Which income account this revenue posts to once sent.'],
                            ['n' => 3, 'title' => 'Invoice Date', 'text' => 'Defaults to today.'],
                            ['n' => 4, 'title' => 'Due Date', 'text' => 'Used to flag the invoice as overdue later.'],
                            ['n' => 5, 'title' => 'Line Items', 'text' => 'Description, quantity, and unit price — the subtotal updates as you type.'],
                            ['n' => 6, 'title' => 'Add Line', 'text' => 'Add as many line items as the invoice needs.'],
                        ],
                    ],
                    [
                        'image' => 'receivables-invoice-draft.jpg',
                        'caption' => 'A saved draft invoice',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Send', 'text' => 'Posts the real ledger entry (debit Accounts Receivable, credit Income) and marks it sent.'],
                            ['n' => 2, 'title' => 'Delete', 'text' => 'A draft can be deleted freely — nothing has posted to the ledger yet.'],
                            ['n' => 3, 'title' => 'Status', 'text' => '"Draft" means this invoice has no effect on your books until sent.'],
                            ['n' => 4, 'title' => 'Balance', 'text' => 'What the client still owes — equal to the total until a payment is recorded.'],
                            ['n' => 5, 'title' => 'Line Items', 'text' => 'What was billed, read-only once saved.'],
                            ['n' => 6, 'title' => 'Payment History', 'text' => 'Empty until the first payment is recorded.'],
                        ],
                    ],
                    [
                        'image' => 'receivables-invoice-sent.jpg',
                        'caption' => 'A sent invoice, awaiting payment',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Record Payment', 'text' => 'Opens the payment form once money actually arrives.'],
                            ['n' => 2, 'title' => 'Cancel', 'text' => 'Reverses the sent invoice\'s ledger entry instead of deleting it, preserving the audit trail.'],
                            ['n' => 3, 'title' => 'Status', 'text' => '"Sent" means the income has posted and the client now owes this balance.'],
                            ['n' => 4, 'title' => 'Balance', 'text' => 'Still equal to the full total — no payment recorded yet.'],
                            ['n' => 5, 'title' => 'Line Items', 'text' => 'What was billed.'],
                            ['n' => 6, 'title' => 'Payment History', 'text' => 'Will list every payment as it\'s recorded.'],
                        ],
                    ],
                    [
                        'image' => 'receivables-payment-form.jpg',
                        'caption' => 'Recording a payment',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Amount', 'text' => 'Can be less than the full balance — the invoice becomes "partially paid".'],
                            ['n' => 2, 'title' => 'Date', 'text' => 'When the payment was actually received.'],
                            ['n' => 3, 'title' => 'Deposited Into', 'text' => 'Which cash, bank, or mobile money account received the money.'],
                            ['n' => 4, 'title' => 'Reference', 'text' => 'Optional receipt or transfer reference for reconciliation.'],
                        ],
                    ],
                    [
                        'image' => 'receivables-invoice-paid.jpg',
                        'caption' => 'After a payment is recorded',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Status', 'text' => 'Moves to "partially paid" or "paid" automatically based on the balance.'],
                            ['n' => 2, 'title' => 'Paid / Balance', 'text' => 'Updates immediately — the ledger entry behind this is a real deposit into the account you chose.'],
                            ['n' => 3, 'title' => 'Payment History', 'text' => 'Every payment recorded against this invoice, with the account it landed in.'],
                        ],
                    ],
                ],
                'tips' => [
                    'Receivables are standalone from Orders — invoicing a job does not automatically create an order, and vice versa.',
                    'An invoice only affects your books once it\'s sent; a draft can be edited or deleted freely.',
                ],
            ],
            [
                'slug' => 'finance-payables',
                'module' => 'Finance',
                'title' => 'Accounts Payable',
                'summary' => 'Bills and money you owe to suppliers — draft, submit, and pay them.',
                'screenshots' => [
                    [
                        'image' => 'payables-list.jpg',
                        'caption' => 'The Payables list',
                        'callouts' => [
                            ['n' => 1, 'title' => 'New Bill', 'text' => 'Starts a new bill as a draft.'],
                            ['n' => 2, 'title' => 'Total Outstanding', 'text' => 'Everything you still owe across every unpaid bill.'],
                            ['n' => 3, 'title' => 'Overdue Bills', 'text' => 'Submitted bills past their due date with a balance remaining.'],
                            ['n' => 4, 'title' => 'Status filter', 'text' => 'Jump straight to draft, submitted, partially paid, paid, or cancelled bills.'],
                            ['n' => 5, 'title' => 'Bill row', 'text' => 'Supplier, due date, total, paid so far, remaining balance, and status.'],
                        ],
                    ],
                    [
                        'image' => 'payables-bill-form.jpg',
                        'caption' => 'Creating a new bill',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Supplier', 'text' => 'Who this bill is owed to.'],
                            ['n' => 2, 'title' => 'Expense Category', 'text' => 'Which expense account this cost posts to once submitted.'],
                            ['n' => 3, 'title' => 'Bill Date', 'text' => 'Defaults to today.'],
                            ['n' => 4, 'title' => 'Due Date', 'text' => 'Used to flag the bill as overdue later.'],
                            ['n' => 5, 'title' => 'Line Items', 'text' => 'Description, quantity, and unit price for what was purchased.'],
                        ],
                    ],
                    [
                        'image' => 'payables-bill-draft.jpg',
                        'caption' => 'A saved draft bill',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Submit', 'text' => 'Posts the real ledger entry (debit the expense, credit Accounts Payable).'],
                            ['n' => 2, 'title' => 'Delete', 'text' => 'A draft can be deleted freely — nothing has posted yet.'],
                            ['n' => 3, 'title' => 'Status', 'text' => '"Draft" has no effect on your books until submitted.'],
                            ['n' => 4, 'title' => 'Balance', 'text' => 'What you still owe — equal to the total until a payment is recorded.'],
                            ['n' => 5, 'title' => 'Line Items', 'text' => 'What was purchased.'],
                            ['n' => 6, 'title' => 'Payment History', 'text' => 'Empty until the first payment is recorded.'],
                        ],
                    ],
                ],
                'tips' => [
                    'Payables are standalone from Procurement — recording a purchase request does not automatically create a bill.',
                    'Paying a bill is recorded the same way as an invoice payment, just from the opposite side — money leaves one of your accounts.',
                ],
            ],
            [
                'slug' => 'finance-general-ledger',
                'module' => 'Finance',
                'title' => 'General Ledger',
                'summary' => 'Every financial transaction in the business, recorded as balanced debits and credits — the permanent record everything else is built from.',
                'screenshots' => [
                    [
                        'image' => 'general-ledger-list.jpg',
                        'caption' => 'The General Ledger',
                        'callouts' => [
                            ['n' => 1, 'title' => 'From / To', 'text' => 'Narrow the ledger down to a specific date range.'],
                            ['n' => 2, 'title' => 'Filter', 'text' => 'Applies the date range.'],
                            ['n' => 3, 'title' => 'Entry row', 'text' => 'Every entry links back to the invoice, bill, or transaction that created it.'],
                        ],
                    ],
                    [
                        'image' => 'general-ledger-entry.jpg',
                        'caption' => 'A single journal entry',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Date', 'text' => 'When the entry was posted.'],
                            ['n' => 2, 'title' => 'Type / Recorded By', 'text' => 'What kind of event created this entry, and who triggered it.'],
                            ['n' => 3, 'title' => 'Journal Lines', 'text' => 'The actual debits and credits — always balanced, total debit equals total credit.'],
                        ],
                    ],
                ],
                'tips' => [
                    'You never edit or delete an entry here directly — cancelling an invoice or bill reverses its entry with a mirror-image entry, so the full history is always preserved.',
                    'This is the source of truth behind every number shown elsewhere in Finance.',
                ],
            ],
            [
                'slug' => 'finance-asset-ledger',
                'module' => 'Finance',
                'title' => 'Asset Ledger',
                'summary' => 'Track company assets — equipment, vehicles, and other property — and how their value changes over time.',
                'screenshots' => [
                    [
                        'image' => 'asset-ledger-list.jpg',
                        'caption' => 'The Asset Ledger',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Add Asset', 'text' => 'Records a new asset and its initial acquisition value.'],
                            ['n' => 2, 'title' => 'Total Assets', 'text' => 'Count of assets currently tracked.'],
                            ['n' => 3, 'title' => 'Current Value', 'text' => 'Combined current value across all assets, after any depreciation.'],
                            ['n' => 4, 'title' => 'Asset row', 'text' => 'Name, category, purchase details, and current value.'],
                            ['n' => 5, 'title' => 'View Ledger', 'text' => 'Opens the full history of entries for this one asset.'],
                        ],
                    ],
                    [
                        'image' => 'asset-ledger-form.jpg',
                        'caption' => 'Adding a new asset',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Name', 'text' => 'What the asset is, e.g. "Large Format Printer".'],
                            ['n' => 2, 'title' => 'Asset Tag', 'text' => 'Optional internal tracking code.'],
                            ['n' => 3, 'title' => 'Category', 'text' => 'Free text, e.g. Vehicle or Equipment.'],
                            ['n' => 4, 'title' => 'Purchase Date', 'text' => 'When the asset was acquired.'],
                            ['n' => 5, 'title' => 'Purchase Cost', 'text' => 'Posts an acquisition entry to the asset\'s own ledger immediately.'],
                            ['n' => 6, 'title' => 'Status', 'text' => 'Active by default — change it when an asset is disposed of.'],
                            ['n' => 7, 'title' => 'Department', 'text' => 'Optional — which department the asset belongs to.'],
                            ['n' => 8, 'title' => 'Location', 'text' => 'Optional — where the asset physically is.'],
                        ],
                    ],
                    [
                        'image' => 'asset-detail.jpg',
                        'caption' => 'A single asset\'s detail page',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Record Entry', 'text' => 'Adds a depreciation, revaluation, or disposal entry to this asset.'],
                            ['n' => 2, 'title' => 'Current Value', 'text' => 'Updates as entries are recorded against this asset.'],
                            ['n' => 3, 'title' => 'Status', 'text' => 'Active, disposed, or under repair.'],
                            ['n' => 4, 'title' => 'Ledger History', 'text' => 'Every entry recorded against this asset since it was acquired.'],
                        ],
                    ],
                    [
                        'image' => 'asset-record-entry-form.jpg',
                        'caption' => 'Recording a ledger entry',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Entry Type', 'text' => 'Depreciation, revaluation, or disposal.'],
                            ['n' => 2, 'title' => 'Amount', 'text' => 'How much the value changes by.'],
                            ['n' => 3, 'title' => 'Date', 'text' => 'When this change took effect.'],
                            ['n' => 4, 'title' => 'Description', 'text' => 'Optional notes explaining the entry.'],
                        ],
                    ],
                ],
                'tips' => [
                    'Recording an asset\'s purchase cost posts a real acquisition entry — it isn\'t just a note.',
                ],
            ],
            [
                'slug' => 'finance-reports',
                'module' => 'Finance',
                'title' => 'Financial Reports',
                'summary' => 'Profit & loss, balance sheet, and transaction history — the reports you\'ll actually be asked for.',
                'screenshots' => [
                    [
                        'image' => 'reports-index.jpg',
                        'caption' => 'The Financial Reports hub',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Profit & Loss', 'text' => 'Income and expenses for a period, ending in net profit.'],
                            ['n' => 2, 'title' => 'Balance Sheet', 'text' => 'Assets, liabilities, and equity as of a given date.'],
                            ['n' => 3, 'title' => 'Transaction Report', 'text' => 'Every recorded transaction, filterable by date, type, category, and account.'],
                        ],
                    ],
                    [
                        'image' => 'reports-profit-loss.jpg',
                        'caption' => 'Profit & Loss',
                        'callouts' => [
                            ['n' => 1, 'title' => 'From / To', 'text' => 'Choose the period to report on.'],
                            ['n' => 2, 'title' => 'Apply', 'text' => 'Recalculates the report for the chosen period.'],
                            ['n' => 3, 'title' => 'Income', 'text' => 'Every income account with activity in the period.'],
                            ['n' => 4, 'title' => 'Expenses', 'text' => 'Every expense account with activity — Net Profit is Income minus this.'],
                        ],
                    ],
                    [
                        'image' => 'reports-balance-sheet.jpg',
                        'caption' => 'Balance Sheet',
                        'callouts' => [
                            ['n' => 1, 'title' => 'As of', 'text' => 'The snapshot date — a balance sheet is always as-of a single date, not a range.'],
                            ['n' => 2, 'title' => 'Assets', 'text' => 'What the business owns, including cash and money owed to it.'],
                            ['n' => 3, 'title' => 'Liabilities', 'text' => 'What the business owes.'],
                            ['n' => 4, 'title' => 'Equity', 'text' => 'Includes the current period\'s unclosed net income.'],
                            ['n' => 5, 'title' => 'Balanced check', 'text' => 'Assets must always equal Liabilities plus Equity — if this ever shows unbalanced, something in the ledger is wrong.'],
                        ],
                    ],
                    [
                        'image' => 'reports-transaction-report.jpg',
                        'caption' => 'Transaction Report',
                        'callouts' => [
                            ['n' => 1, 'title' => 'From / To', 'text' => 'Date range to search within.'],
                            ['n' => 2, 'title' => 'Type', 'text' => 'Narrow to income or expense only.'],
                            ['n' => 3, 'title' => 'Category', 'text' => 'Search by category name.'],
                            ['n' => 4, 'title' => 'Account', 'text' => 'Narrow to a single cash, bank, or mobile money account.'],
                            ['n' => 5, 'title' => 'Filter', 'text' => 'Applies all the filters above.'],
                        ],
                    ],
                ],
                'tips' => [
                    'The Balance Sheet\'s "Balanced" check is a genuine integrity check — it is only possible because every transaction elsewhere in Finance posts as a proper double-entry.',
                ],
            ],
            [
                'slug' => 'crm-lead-management',
                'module' => 'CRM',
                'title' => 'Lead Management',
                'summary' => 'Track leads and prospects from first contact through to a won or lost deal.',
                'screenshots' => [
                    [
                        'image' => 'crm-lead-management.jpg',
                        'caption' => 'The Lead Management board',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Quick Lead', 'text' => 'Fast-add a new lead with minimal detail.'],
                            ['n' => 2, 'title' => 'Start Sale Campaign', 'text' => 'Launches a marketing campaign targeted at your current leads.'],
                            ['n' => 3, 'title' => 'Total Leads', 'text' => 'One of several stat cards — also tracks New, Prospects, Pipeline Value, Open Deals, Won, and Lost.'],
                            ['n' => 4, 'title' => 'Source filter', 'text' => 'Filter leads by how they came in — Referral, Website, Cold Call, Social Media, and more.'],
                            ['n' => 5, 'title' => 'Lead card', 'text' => 'Company, contact, location, source, last activity, and a lead score.'],
                            ['n' => 6, 'title' => 'Status dropdown', 'text' => 'Move a lead through the pipeline — New Lead, Negotiating, Won, Lost, and so on.'],
                        ],
                    ],
                ],
                'tips' => [
                    'A lead\'s pipeline stage feeds directly into the Reports page\'s Sales Funnel and Win Rate figures.',
                ],
            ],
            [
                'slug' => 'crm-reports',
                'module' => 'CRM',
                'title' => 'CRM Reports',
                'summary' => 'Analytics and insights across your clients and pipeline.',
                'screenshots' => [
                    [
                        'image' => 'crm-reports.jpg',
                        'caption' => 'CRM Reports',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Total Clients', 'text' => 'One of several stat cards — also tracks Gold/Platinum tier counts, Win Rate, Pipeline Value, and Won Revenue.'],
                            ['n' => 2, 'title' => 'Win Rate', 'text' => 'Share of closed deals that were won rather than lost.'],
                            ['n' => 3, 'title' => 'Monthly New Clients', 'text' => 'New client growth over the last 12 months.'],
                            ['n' => 4, 'title' => 'Tier Breakdown', 'text' => 'How many clients sit in each of the Bronze/Silver/Gold/Platinum tiers.'],
                            ['n' => 5, 'title' => 'Sales Funnel', 'text' => 'How many leads are sitting at each pipeline stage right now.'],
                            ['n' => 6, 'title' => 'Lost Reasons', 'text' => 'Why deals were lost, so patterns are easy to spot.'],
                        ],
                    ],
                ],
                'tips' => [
                    'These figures update live as leads move through Lead Management and clients are added or re-tiered.',
                ],
            ],
            [
                'slug' => 'marketing',
                'module' => 'Marketing',
                'title' => 'Campaigns',
                'summary' => 'Plan, schedule, and track marketing campaigns on a calendar, from social posts to sales pushes.',
                'screenshots' => [
                    [
                        'image' => 'marketing-calendar.jpg',
                        'caption' => 'The Marketing calendar',
                        'callouts' => [
                            ['n' => 1, 'title' => 'New Campaign', 'text' => 'Opens the form to create a campaign.'],
                            ['n' => 2, 'title' => 'Active Campaigns', 'text' => 'Campaigns currently running today.'],
                            ['n' => 3, 'title' => 'Total Budget', 'text' => 'Combined planned budget across every campaign.'],
                            ['n' => 4, 'title' => 'View switcher', 'text' => 'Switch between Month, Week, Day, or Agenda views.'],
                            ['n' => 5, 'title' => 'Campaign bar', 'text' => 'Spans the campaign\'s start to end date — click it for a quick summary.'],
                        ],
                    ],
                    [
                        'image' => 'marketing-campaign-popover.jpg',
                        'caption' => 'Clicking a campaign for a quick look',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Status', 'text' => 'Draft, scheduled, active, completed, or cancelled.'],
                            ['n' => 2, 'title' => 'Duration', 'text' => 'The campaign\'s start and end date.'],
                            ['n' => 3, 'title' => 'Budget', 'text' => 'What was planned to be spent.'],
                            ['n' => 4, 'title' => 'View', 'text' => 'Opens the full campaign detail page.'],
                            ['n' => 5, 'title' => 'Edit', 'text' => 'Change any detail of the campaign.'],
                            ['n' => 6, 'title' => 'Cancel', 'text' => 'Marks the campaign cancelled without deleting its history.'],
                        ],
                    ],
                    [
                        'image' => 'marketing-campaign-detail.jpg',
                        'caption' => 'A campaign\'s detail page',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Edit', 'text' => 'Change any detail of the campaign.'],
                            ['n' => 2, 'title' => 'Cancel', 'text' => 'Marks the campaign cancelled.'],
                            ['n' => 3, 'title' => 'Campaign Details', 'text' => 'Duration, type, who it\'s assigned to, and a description.'],
                            ['n' => 4, 'title' => 'Budget', 'text' => 'Planned budget vs. actual cost, with the remaining balance.'],
                            ['n' => 5, 'title' => 'Tags', 'text' => 'Free-form labels for grouping and filtering campaigns.'],
                            ['n' => 6, 'title' => 'Reminders', 'text' => 'Custom reminder dates so a campaign step isn\'t missed.'],
                        ],
                    ],
                    [
                        'image' => 'marketing-campaign-form.jpg',
                        'caption' => 'Creating a new campaign',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Title', 'text' => 'The campaign name.'],
                            ['n' => 2, 'title' => 'Description', 'text' => 'Optional notes about what this campaign is for.'],
                            ['n' => 3, 'title' => 'Type', 'text' => 'Social, Email, Event, Ad, Print, or Other.'],
                            ['n' => 4, 'title' => 'Status', 'text' => 'Start as Draft, or set Scheduled/Active directly.'],
                            ['n' => 5, 'title' => 'Start / End Date', 'text' => 'Defines where the campaign appears on the calendar.'],
                            ['n' => 6, 'title' => 'Client', 'text' => 'Optional — link the campaign to a specific client, or leave it standalone.'],
                            ['n' => 7, 'title' => 'Assigned To', 'text' => 'Who owns this campaign.'],
                            ['n' => 8, 'title' => 'Budget / Actual Cost', 'text' => 'Track planned vs. real spend as the campaign runs.'],
                            ['n' => 9, 'title' => 'Tags', 'text' => 'Add free-form labels for later filtering.'],
                            ['n' => 10, 'title' => 'Reminders', 'text' => 'Add one or more dates to be reminded about this campaign.'],
                        ],
                    ],
                ],
                'tips' => [
                    'A campaign can exist without a client — useful for general brand pushes that aren\'t targeted at one account.',
                    'The "Start Sale Campaign" shortcut on the Clients and Lead Management pages pre-fills this form for that specific client or lead.',
                ],
            ],
            [
                'slug' => 'inventory',
                'module' => 'Inventory',
                'title' => 'Inventory Overview',
                'summary' => 'Suppliers, materials, stock levels, and requisitions — everything needed to know what you have and where it came from.',
                'screenshots' => [
                    [
                        'image' => 'inventory-overview.jpg',
                        'caption' => 'The Inventory overview',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Sub-navigation', 'text' => 'Suppliers, Materials, Stock, and Requisition each have their own tab.'],
                            ['n' => 2, 'title' => 'Total Materials', 'text' => 'How many distinct material types are tracked, active or disabled.'],
                            ['n' => 3, 'title' => 'Stock on Hand', 'text' => 'Combined quantity across every material, in whatever unit each is tracked in.'],
                            ['n' => 4, 'title' => 'Low Stock', 'text' => 'Materials at or below their reorder threshold — worth checking before it hits zero.'],
                            ['n' => 5, 'title' => 'Pending Requisitions', 'text' => 'Stock requests awaiting approval.'],
                            ['n' => 6, 'title' => 'Materials by Category', 'text' => 'Where your stock is concentrated, by category.'],
                        ],
                    ],
                ],
                'tips' => [
                    'This overview is read-only — use the Suppliers, Materials, Stock, and Requisition tabs to actually manage anything.',
                ],
            ],
            [
                'slug' => 'inventory-suppliers',
                'module' => 'Inventory',
                'title' => 'Suppliers',
                'summary' => 'Every vendor you buy materials from, including multiple branches per supplier.',
                'screenshots' => [
                    [
                        'image' => 'inventory-suppliers.jpg',
                        'caption' => 'The Suppliers list',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Add Supplier', 'text' => 'Register a new vendor.'],
                            ['n' => 2, 'title' => 'Search', 'text' => 'Filters suppliers live by name.'],
                            ['n' => 3, 'title' => 'Supplier card', 'text' => 'One card per supplier, showing all its branches.'],
                            ['n' => 4, 'title' => 'Branch', 'text' => 'A supplier can have several branches, each with its own contact and location.'],
                            ['n' => 5, 'title' => 'Edit / Delete', 'text' => 'Update a supplier\'s details or remove it.'],
                        ],
                    ],
                ],
                'tips' => [
                    'A supplier with multiple branches lets you record which specific branch a purchase or bill came from.',
                ],
            ],
            [
                'slug' => 'inventory-materials',
                'module' => 'Inventory',
                'title' => 'Materials',
                'summary' => 'The catalog of raw materials and supplies used in production — fabrics, trims, packaging, and more.',
                'screenshots' => [
                    [
                        'image' => 'inventory-materials.jpg',
                        'caption' => 'The Materials list',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Add Material', 'text' => 'Register a new material with its own ID, category, and unit of measure.'],
                            ['n' => 2, 'title' => 'Search', 'text' => 'Filters materials live by name or ID.'],
                            ['n' => 3, 'title' => 'Stock Level', 'text' => 'Current quantity on hand, in the material\'s own unit of measure.'],
                            ['n' => 4, 'title' => 'Edit / Delete', 'text' => 'Update a material\'s details or remove it.'],
                        ],
                    ],
                ],
                'tips' => [
                    'Every material here can be used as a component when building a Product or costing a Service.',
                ],
            ],
            [
                'slug' => 'inventory-stock',
                'module' => 'Inventory',
                'title' => 'Stock',
                'summary' => 'Every purchase that added to stock, plus the resulting stock levels.',
                'screenshots' => [
                    [
                        'image' => 'inventory-stock.jpg',
                        'caption' => 'Stock purchases',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Add Purchase', 'text' => 'Record a new stock purchase, increasing that material\'s stock level.'],
                            ['n' => 2, 'title' => 'Stock Levels tab', 'text' => 'Switch to see current quantities instead of the purchase history.'],
                            ['n' => 3, 'title' => 'Search', 'text' => 'Filters purchases live by material name.'],
                            ['n' => 4, 'title' => 'Purchase row', 'text' => 'Material, quantity, price, and total cost of each purchase.'],
                        ],
                    ],
                ],
                'tips' => [
                    'This is where stock actually increases — a requisition only decreases it once approved.',
                ],
            ],
            [
                'slug' => 'inventory-requisition',
                'module' => 'Inventory',
                'title' => 'Requisition',
                'summary' => 'Requests from teams to draw materials out of stock, with an approve/reject workflow.',
                'screenshots' => [
                    [
                        'image' => 'inventory-requisition.jpg',
                        'caption' => 'The Requisition list',
                        'callouts' => [
                            ['n' => 1, 'title' => 'New Request', 'text' => 'Request a quantity of a material be drawn from stock.'],
                            ['n' => 2, 'title' => 'Status', 'text' => 'Pending, approved, or rejected.'],
                            ['n' => 3, 'title' => 'Approve / Reject', 'text' => 'Only shown while a request is pending — approving deducts the quantity from stock.'],
                        ],
                    ],
                ],
                'tips' => [
                    'Approving a requisition is what actually reduces stock — a pending request has no effect yet.',
                ],
            ],
            [
                'slug' => 'procurement-overview',
                'module' => 'Procurement',
                'title' => 'Procurement Overview',
                'summary' => 'Purchase requests, purchase orders, and the OpEx goods catalog, from request to delivery.',
                'screenshots' => [
                    [
                        'image' => 'procurement-overview.jpg',
                        'caption' => 'The Procurement overview',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Sub-navigation', 'text' => 'Purchase Requests, Purchase Orders, and OpEx Items each have their own tab.'],
                            ['n' => 2, 'title' => 'Total PRs', 'text' => 'How many purchase requests have been raised.'],
                            ['n' => 3, 'title' => 'Pending', 'text' => 'Requests waiting on the next approval step.'],
                            ['n' => 4, 'title' => 'Total POs', 'text' => 'Purchase orders that have gone out to suppliers.'],
                            ['n' => 5, 'title' => 'Recent activity', 'text' => 'The latest requests and orders, with a link to see everything.'],
                        ],
                    ],
                ],
                'tips' => [
                    'A purchase request becomes a purchase order once it clears department and finance approval — it isn\'t automatic.',
                ],
            ],
            [
                'slug' => 'procurement-purchase-requests',
                'module' => 'Procurement',
                'title' => 'Purchase Requests',
                'summary' => 'Requests to buy something, routed through department and finance approval before becoming an order.',
                'screenshots' => [
                    [
                        'image' => 'procurement-purchase-requests.jpg',
                        'caption' => 'The Purchase Requests list',
                        'callouts' => [
                            ['n' => 1, 'title' => 'New PR', 'text' => 'Start a new purchase request.'],
                            ['n' => 2, 'title' => 'Status filter', 'text' => 'Jump to Pending, Dept Approved, Finance Approved, PO Created, Rejected, Held, or Cancelled requests.'],
                            ['n' => 3, 'title' => 'Priority', 'text' => 'Low, Normal, High, or Emergency — helps approvers triage.'],
                            ['n' => 4, 'title' => 'Status', 'text' => 'Where the request sits in the approval chain right now.'],
                            ['n' => 5, 'title' => 'View', 'text' => 'Opens the full request, its items, and its audit trail.'],
                        ],
                    ],
                    [
                        'image' => 'procurement-pr-detail.jpg',
                        'caption' => 'A purchase request\'s detail page',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Approval stepper', 'text' => 'Draft → Submitted → Dept Review → Finance → PO Created — shows exactly where this request is.'],
                            ['n' => 2, 'title' => 'Items', 'text' => 'What\'s being requested, with quantity, estimated cost, and total.'],
                            ['n' => 3, 'title' => 'Details', 'text' => 'Status, priority, department, and when it\'s needed by.'],
                            ['n' => 4, 'title' => 'Purpose', 'text' => 'Why this is being requested — helps approvers decide quickly.'],
                            ['n' => 5, 'title' => 'Actions', 'text' => 'Approve, reject, hold, or query the request — only the relevant actions show at each stage.'],
                            ['n' => 6, 'title' => 'Audit Trail', 'text' => 'Every status change, who made it, and when.'],
                        ],
                    ],
                ],
                'tips' => [
                    'A request queried back to the requester isn\'t rejected — it\'s asking for more information before a decision is made.',
                ],
            ],
            [
                'slug' => 'procurement-purchase-orders',
                'module' => 'Procurement',
                'title' => 'Purchase Orders',
                'summary' => 'The formal order sent to a supplier once a purchase request is fully approved.',
                'screenshots' => [
                    [
                        'image' => 'procurement-purchase-orders.jpg',
                        'caption' => 'The Purchase Orders list',
                        'callouts' => [
                            ['n' => 1, 'title' => 'New PO', 'text' => 'Create a purchase order directly, or generate one from an approved request.'],
                            ['n' => 2, 'title' => 'Status filter', 'text' => 'Draft, Ordered, Purchased, Inspected, Closed, or Cancelled.'],
                            ['n' => 3, 'title' => 'Status', 'text' => 'Where this order is in the fulfilment process.'],
                            ['n' => 4, 'title' => 'View', 'text' => 'Opens the full order detail.'],
                        ],
                    ],
                ],
                'tips' => [
                    'Marking an order Inspected is the point to check what was delivered actually matches what was ordered before Closing it.',
                ],
            ],
            [
                'slug' => 'procurement-opex-items',
                'module' => 'Procurement',
                'title' => 'OpEx Items',
                'summary' => 'The catalog of non-inventory goods and services purchased for operating expenses — not raw materials for production.',
                'screenshots' => [
                    [
                        'image' => 'procurement-opex-items.jpg',
                        'caption' => 'The OpEx Items catalog',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Add Item', 'text' => 'Register a new operating-expense good or service, e.g. office supplies or utilities.'],
                            ['n' => 2, 'title' => 'Category', 'text' => 'Groups items for easier searching when building a purchase request.'],
                        ],
                    ],
                ],
                'tips' => [
                    'Use OpEx Items for things that don\'t belong in the Inventory Materials catalog — anything that isn\'t consumed directly into a product.',
                ],
            ],
            [
                'slug' => 'orders',
                'module' => 'Orders',
                'title' => 'Orders',
                'summary' => 'Sales orders from a client, through payment and production, to delivery.',
                'screenshots' => [
                    [
                        'image' => 'orders-list.jpg',
                        'caption' => 'The Orders list',
                        'callouts' => [
                            ['n' => 1, 'title' => 'New Order', 'text' => 'Start a new sales order.'],
                            ['n' => 2, 'title' => 'Status filter', 'text' => 'Jump to Draft, Confirmed, Payment Received, In Production, Ready, Delivered, or Cancelled orders.'],
                            ['n' => 3, 'title' => 'Status', 'text' => 'Where the order sits in its lifecycle.'],
                            ['n' => 4, 'title' => 'View', 'text' => 'Opens the full order, its items, payments, and production link.'],
                        ],
                    ],
                    [
                        'image' => 'orders-create-form.jpg',
                        'caption' => 'Creating a new order',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Client', 'text' => 'Required — who the order is for.'],
                            ['n' => 2, 'title' => 'Delivery Date', 'text' => 'Optional, but useful for planning production.'],
                            ['n' => 3, 'title' => 'Add Item', 'text' => 'Add another product or service line.'],
                            ['n' => 4, 'title' => 'Line Items', 'text' => 'Pick a product or service, set quantity and any discount.'],
                            ['n' => 5, 'title' => 'Summary', 'text' => 'Subtotal, discount, tax, and total update live as items are added.'],
                            ['n' => 6, 'title' => 'Save as Draft', 'text' => 'Creates the order without confirming it yet — nothing is committed to production or payment.'],
                        ],
                    ],
                    [
                        'image' => 'orders-detail.jpg',
                        'caption' => 'An order\'s detail page',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Mark Delivered / Cancel', 'text' => 'The actions available change depending on the order\'s current status.'],
                            ['n' => 2, 'title' => 'Lifecycle stepper', 'text' => 'Draft → Confirmed → Payment → In Production → Ready → Delivered.'],
                            ['n' => 3, 'title' => 'Status History', 'text' => 'Every status change, who made it, and when.'],
                            ['n' => 4, 'title' => 'Order Items', 'text' => 'What was ordered, with quantity, price, discount, and line total.'],
                            ['n' => 5, 'title' => 'Status & Production', 'text' => 'Current status, and a link to the linked production job once one exists.'],
                            ['n' => 6, 'title' => 'Payment', 'text' => 'Amount paid, balance remaining, and a full payment history.'],
                            ['n' => 7, 'title' => 'Summary', 'text' => 'Subtotal, discount, tax, and total for the order.'],
                        ],
                    ],
                ],
                'tips' => [
                    'An order moves to In Production automatically once it has a linked Production Job — see the Production module.',
                    'Orders are standalone from Receivables — an order\'s payment here doesn\'t create a Finance invoice, and vice versa.',
                ],
            ],
            [
                'slug' => 'order-reports',
                'module' => 'Orders',
                'title' => 'Order Reports',
                'summary' => 'Sales analytics — revenue, order volume, and what\'s actually selling.',
                'screenshots' => [
                    [
                        'image' => 'orders-reports.jpg',
                        'caption' => 'Order Reports',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Total Orders', 'text' => 'One of several stat cards — also tracks Delivered, Cancelled, and Paid counts.'],
                            ['n' => 2, 'title' => 'Total Revenue', 'text' => 'Combined value of every order, regardless of payment status.'],
                            ['n' => 3, 'title' => 'Avg Order Value', 'text' => 'Total Revenue divided by Total Orders.'],
                            ['n' => 4, 'title' => 'Monthly Orders', 'text' => 'Order volume over the last 12 months.'],
                            ['n' => 5, 'title' => 'Status Breakdown', 'text' => 'How many orders sit at each lifecycle stage right now.'],
                            ['n' => 6, 'title' => 'Top Products by Revenue', 'text' => 'Which products and services are actually driving sales.'],
                            ['n' => 7, 'title' => 'Payment Status', 'text' => 'How many orders are unpaid, partially paid, or fully paid.'],
                        ],
                    ],
                ],
                'tips' => [
                    'Revenue here counts every confirmed order, whether or not it has been paid — check Payment Status alongside it for the full picture.',
                ],
            ],
            [
                'slug' => 'production',
                'module' => 'Production',
                'title' => 'Production',
                'summary' => 'A Kanban board tracking every job from a confirmed order through to completion.',
                'screenshots' => [
                    [
                        'image' => 'production-kanban.jpg',
                        'caption' => 'The Production board',
                        'callouts' => [
                            ['n' => 1, 'title' => 'New Job', 'text' => 'Create a production job manually, outside the normal order flow.'],
                            ['n' => 2, 'title' => 'On Shop Floor', 'text' => 'One of several stat cards — also tracks Queued, Completed, and Urgent counts.'],
                            ['n' => 3, 'title' => 'Priority filter', 'text' => 'Narrow the board to one priority level.'],
                            ['n' => 4, 'title' => 'Column', 'text' => 'New Jobs, Design, Printing, Assembly, QC & Inspection, and Completed — drag a card to move it.'],
                            ['n' => 5, 'title' => 'Job card', 'text' => 'Priority, job number, linked order, items to produce, due date, and who it\'s assigned to.'],
                            ['n' => 6, 'title' => 'Paused / Cancelled', 'text' => 'Switch tabs to see jobs that have been taken off the active workflow.'],
                        ],
                    ],
                    [
                        'image' => 'production-job-detail.jpg',
                        'caption' => 'Clicking a job for details',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Stage', 'text' => 'The Kanban column this job currently sits in.'],
                            ['n' => 2, 'title' => 'Priority', 'text' => 'Low, Normal, High, or Urgent.'],
                            ['n' => 3, 'title' => 'Started', 'text' => 'When work on this job actually began.'],
                            ['n' => 4, 'title' => 'Items to Produce', 'text' => 'The products and quantities this job needs to deliver.'],
                        ],
                    ],
                ],
                'tips' => [
                    'A job is created automatically when an order is confirmed — moving it to Completed is what allows the order to be marked Delivered.',
                ],
            ],
            [
                'slug' => 'production-reports',
                'module' => 'Production',
                'title' => 'Production Reports',
                'summary' => 'Job throughput and workload analytics across the shop floor.',
                'screenshots' => [
                    [
                        'image' => 'production-reports.jpg',
                        'caption' => 'Production Reports',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Total Jobs', 'text' => 'One of several stat cards — also tracks Completed and Overdue counts.'],
                            ['n' => 2, 'title' => 'Avg Completion', 'text' => 'Average time from a job starting to being completed.'],
                            ['n' => 3, 'title' => 'Monthly Jobs Created', 'text' => 'Job volume over the last 12 months.'],
                            ['n' => 4, 'title' => 'Jobs by Status', 'text' => 'How many jobs sit in each Kanban column right now.'],
                            ['n' => 5, 'title' => 'Jobs by Priority', 'text' => 'How workload is distributed across priority levels.'],
                            ['n' => 6, 'title' => 'Active Workload', 'text' => 'How many jobs are currently assigned to each person.'],
                        ],
                    ],
                ],
                'tips' => [
                    'Use Active Workload to spot when one person is overloaded before it causes a delay.',
                ],
            ],
            [
                'slug' => 'hrm-dashboard',
                'module' => 'HRM',
                'title' => 'HR Dashboard',
                'summary' => 'A snapshot of headcount, attendance, leave, and payroll for the whole business.',
                'screenshots' => [
                    [
                        'image' => 'hrm-dashboard.jpg',
                        'caption' => 'The HR Dashboard',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Total Employees', 'text' => 'Everyone currently on staff.'],
                            ['n' => 2, 'title' => 'Pending Approvals', 'text' => 'Leave requests waiting on a decision.'],
                            ['n' => 3, 'title' => "Today's Attendance", 'text' => 'Present, absent, and on-leave split for today.'],
                            ['n' => 4, 'title' => 'Department Overview', 'text' => 'Headcount by department.'],
                            ['n' => 5, 'title' => 'Pending Leave Approvals', 'text' => 'Approve or reject a request directly from here.'],
                            ['n' => 6, 'title' => 'Payroll Status', 'text' => 'How much of this run has been processed.'],
                        ],
                    ],
                ],
                'tips' => [
                    'What you see here depends on your role — a manager sees their team, while HR/Admin sees the whole business (data-privacy scoping by role).',
                ],
            ],
            [
                'slug' => 'hrm-employees',
                'module' => 'HRM',
                'title' => 'Employees',
                'summary' => 'The staff directory — every employee, their role, and their department.',
                'screenshots' => [
                    [
                        'image' => 'hrm-employees.jpg',
                        'caption' => 'The Employee Directory',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Add Employee', 'text' => 'Register a new staff member.'],
                            ['n' => 2, 'title' => 'Department filter', 'text' => 'Narrow the directory to one department.'],
                            ['n' => 3, 'title' => 'Employee card', 'text' => 'Name, role, department, and employment type — click to edit.'],
                        ],
                    ],
                ],
                'tips' => [
                    'Grid and list views are both available — the icons in the top-right corner switch between them.',
                ],
            ],
            [
                'slug' => 'hrm-attendance',
                'module' => 'HRM',
                'title' => 'Attendance',
                'summary' => 'Clock in and out, and see who\'s present, absent, or on leave.',
                'screenshots' => [
                    [
                        'image' => 'hrm-attendance.jpg',
                        'caption' => 'The Attendance page',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Present / Absent / On Leave', 'text' => 'Today\'s headcount split, company-wide.'],
                            ['n' => 2, 'title' => 'Clock In/Out', 'text' => 'Your own attendance for today.'],
                            ['n' => 3, 'title' => 'Clock In', 'text' => 'Records the time you started work today.'],
                            ['n' => 4, 'title' => 'This Month', 'text' => 'A calendar showing which days you\'ve already clocked in on.'],
                            ['n' => 5, 'title' => 'Recent Activity', 'text' => 'A log of recent clock-ins across the team.'],
                        ],
                    ],
                ],
                'tips' => [
                    'Attendance feeds directly into the HR Dashboard\'s Present/Absent/On Leave numbers.',
                ],
            ],
            [
                'slug' => 'hrm-leaves',
                'module' => 'HRM',
                'title' => 'Leaves',
                'summary' => 'Request time off, check leave balances, and see who\'s away on the team calendar.',
                'screenshots' => [
                    [
                        'image' => 'hrm-leaves.jpg',
                        'caption' => 'The Leaves page',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Request Leave', 'text' => 'Submit a new leave request for approval.'],
                            ['n' => 2, 'title' => 'Leave Balance', 'text' => 'Pick an employee to see their remaining days by leave type.'],
                            ['n' => 3, 'title' => 'Team Leave Calendar', 'text' => 'See at a glance who\'s away on any given day.'],
                            ['n' => 4, 'title' => 'Status & Type filters', 'text' => 'Narrow the request list by status (pending/approved/rejected) or leave type.'],
                        ],
                    ],
                ],
                'tips' => [
                    'Leave types and their annual allowances are configured per business — see HRM Settings.',
                ],
            ],
            [
                'slug' => 'hrm-holidays',
                'module' => 'HRM',
                'title' => 'Holidays',
                'summary' => 'The company and public holiday calendar for the year.',
                'screenshots' => [
                    [
                        'image' => 'hrm-holidays.jpg',
                        'caption' => 'The Holidays calendar',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Add Holiday', 'text' => 'Add a company-specific holiday — public holidays are pre-loaded.'],
                            ['n' => 2, 'title' => 'Total Holidays', 'text' => 'All holidays for the selected year.'],
                            ['n' => 3, 'title' => 'Company Holidays', 'text' => 'Holidays specific to this business, on top of public ones.'],
                            ['n' => 4, 'title' => 'Type filter', 'text' => 'Show only Company or only Public holidays.'],
                            ['n' => 5, 'title' => 'Calendar', 'text' => 'Public holidays in orange, company holidays in purple.'],
                        ],
                    ],
                ],
                'tips' => [
                    'Holidays here are excluded automatically when calculating attendance and leave day counts.',
                ],
            ],
            [
                'slug' => 'hrm-payroll',
                'module' => 'HRM',
                'title' => 'Payroll',
                'summary' => 'Run payroll and keep a history of every payslip issued.',
                'screenshots' => [
                    [
                        'image' => 'hrm-payroll.jpg',
                        'caption' => 'The Payroll page',
                        'callouts' => [
                            ['n' => 1, 'title' => 'This Month', 'text' => 'Total net pay for the current month.'],
                            ['n' => 2, 'title' => 'Payslips', 'text' => 'How many payslips have been issued.'],
                            ['n' => 3, 'title' => '6-Month Take-Home Trend', 'text' => 'How total payroll cost has moved over recent months.'],
                            ['n' => 4, 'title' => 'Filters', 'text' => 'Narrow the payslip history to one employee or one month.'],
                            ['n' => 5, 'title' => 'Export', 'text' => 'Download the payslip history.'],
                            ['n' => 6, 'title' => 'Payslip History', 'text' => 'Basic pay, allowances, deductions, and net pay for every payslip.'],
                            ['n' => 7, 'title' => 'View', 'text' => 'Opens a single payslip in full.'],
                        ],
                    ],
                ],
                'tips' => [
                    'A payslip\'s Net Pay is Basic + Allowances − Deductions — the same figures feed the Finance module\'s expense tracking.',
                ],
            ],
            [
                'slug' => 'hrm-performance',
                'module' => 'HRM',
                'title' => 'Performance',
                'summary' => 'Goals, reviews, and ratings for every employee.',
                'screenshots' => [
                    [
                        'image' => 'hrm-performance.jpg',
                        'caption' => 'The Performance page',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Add Review', 'text' => 'Record a new performance review for an employee.'],
                            ['n' => 2, 'title' => 'Avg Rating', 'text' => 'Average rating across every review recorded.'],
                            ['n' => 3, 'title' => 'Goals Achieved', 'text' => 'Share of set goals marked as achieved.'],
                            ['n' => 4, 'title' => 'Review card', 'text' => 'Rating, goals set, achievements, and manager comments for one review.'],
                        ],
                    ],
                ],
                'tips' => [
                    'Use the employee filter above the review list to see one person\'s full review history.',
                ],
            ],
            [
                'slug' => 'hrm-noticeboard',
                'module' => 'HRM',
                'title' => 'Noticeboard',
                'summary' => 'Company-wide announcements, plus upcoming birthdays and work anniversaries.',
                'screenshots' => [
                    [
                        'image' => 'hrm-noticeboard.jpg',
                        'caption' => 'The Noticeboard',
                        'callouts' => [
                            ['n' => 1, 'title' => 'New Post', 'text' => 'Publish a new announcement to the whole company.'],
                            ['n' => 2, 'title' => 'Announcements', 'text' => 'Every post, newest first — a pin marks the most important one.'],
                            ['n' => 3, 'title' => 'Type filter', 'text' => 'Show only Announcements or only General posts.'],
                            ['n' => 4, 'title' => 'Post card', 'text' => 'Title, message, and the date it was posted.'],
                            ['n' => 5, 'title' => 'Upcoming Birthdays', 'text' => 'A quick reminder of who has a birthday coming up.'],
                        ],
                    ],
                ],
                'tips' => [
                    'A pinned post always stays at the top of the list regardless of date.',
                ],
            ],
            [
                'slug' => 'studio',
                'module' => 'Studio',
                'title' => 'Studio Bookings',
                'summary' => 'Schedule photo and video studio time, and the rooms, equipment, and vehicles that go with it.',
                'screenshots' => [
                    [
                        'image' => 'studio-bookings-list.jpg',
                        'caption' => 'The Studio bookings list',
                        'callouts' => [
                            ['n' => 1, 'title' => 'New Booking', 'text' => 'Schedule a new studio session.'],
                            ['n' => 2, 'title' => 'Status filter', 'text' => 'Tentative, Confirmed, In Progress, Completed, or Cancelled.'],
                            ['n' => 3, 'title' => 'Booking card', 'text' => 'Client, date and time range, and how many resources are reserved for it.'],
                        ],
                    ],
                    [
                        'image' => 'studio-create-booking.jpg',
                        'caption' => 'Creating a new booking',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Title', 'text' => 'What this booking is for, e.g. "Product Catalogue Shoot".'],
                            ['n' => 2, 'title' => 'Client', 'text' => 'Optional — a greylisted client can\'t be booked until the flag is cleared.'],
                            ['n' => 3, 'title' => 'Status', 'text' => 'Start as Tentative, or set Confirmed directly.'],
                            ['n' => 4, 'title' => 'Start / End Date/Time', 'text' => 'Defines the booking\'s slot — used to check for resource conflicts.'],
                            ['n' => 5, 'title' => 'Resources', 'text' => 'Check off which rooms, cameras, lighting, props, or vehicles this booking needs.'],
                            ['n' => 6, 'title' => 'Create Booking', 'text' => 'Reserves the selected resources for the chosen time slot.'],
                        ],
                    ],
                ],
                'tips' => [
                    'A resource can only be booked by one session at a time — the form will only offer resources that are free for the chosen time slot.',
                ],
            ],
            [
                'slug' => 'admin-overview',
                'module' => 'Admin',
                'title' => 'Administration',
                'summary' => 'System-wide settings, users, and roles — only visible to users with admin access.',
                'screenshots' => [
                    [
                        'image' => 'admin-overview.jpg',
                        'caption' => 'The Administration hub',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Total Users', 'text' => 'One of several stat cards — also tracks Active Users, Roles, and Departments.'],
                            ['n' => 2, 'title' => 'User Management', 'text' => 'Add, edit, and manage system users.'],
                            ['n' => 3, 'title' => 'Roles & Permissions', 'text' => 'Configure what each role can access across every module.'],
                            ['n' => 4, 'title' => 'System Settings', 'text' => 'Company info, units of measure, categories, and other shared configuration.'],
                            ['n' => 5, 'title' => 'Quick Actions', 'text' => 'Shortcuts to the most common admin tasks.'],
                            ['n' => 6, 'title' => 'Recent Activity', 'text' => 'A live audit log of changes across the system.'],
                        ],
                    ],
                ],
                'tips' => [
                    'This whole section is restricted — only roles with admin-level permissions can see it in the sidebar at all.',
                ],
            ],
            [
                'slug' => 'admin-users',
                'module' => 'Admin',
                'title' => 'User Management',
                'summary' => 'Every login account in the system, their role, department, and status.',
                'screenshots' => [
                    [
                        'image' => 'admin-users.jpg',
                        'caption' => 'The User Management list',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Add User', 'text' => 'Create a new login account.'],
                            ['n' => 2, 'title' => 'Search', 'text' => 'Filters users live by name or email.'],
                            ['n' => 3, 'title' => 'Active / Inactive', 'text' => 'Show only enabled or disabled accounts.'],
                            ['n' => 4, 'title' => 'Department filter', 'text' => 'Narrow the list to one department.'],
                            ['n' => 5, 'title' => 'Role', 'text' => 'What permission set this user has — "No Role" means they can\'t access anything until one is assigned.'],
                            ['n' => 6, 'title' => 'Edit', 'text' => 'Change a user\'s role, department, or active status.'],
                        ],
                    ],
                ],
                'tips' => [
                    'A user with "No Role" can log in but won\'t be able to see or do anything until a role is assigned to them.',
                ],
            ],
            [
                'slug' => 'admin-roles',
                'module' => 'Admin',
                'title' => 'Roles & Permissions',
                'summary' => 'Define what each role in the business is allowed to see and do.',
                'screenshots' => [
                    [
                        'image' => 'admin-roles.jpg',
                        'caption' => 'The Roles & Permissions list',
                        'callouts' => [
                            ['n' => 1, 'title' => 'Add Role', 'text' => 'Create a new role with its own permission set.'],
                            ['n' => 2, 'title' => 'Available Permissions', 'text' => 'Every permission that exists in the system, grouped by module.'],
                            ['n' => 3, 'title' => 'Role card', 'text' => 'The role\'s name, internal key, and a short description of what it\'s for.'],
                            ['n' => 4, 'title' => 'Permission count', 'text' => 'How many of the available permissions this role has been granted.'],
                        ],
                    ],
                ],
                'tips' => [
                    'A role only grants what its permissions explicitly include — there\'s no partial or inherited access between roles.',
                ],
            ],
            [
                'slug' => 'admin-settings',
                'module' => 'Admin',
                'title' => 'System Settings',
                'summary' => 'Shared configuration used across every module — company details, units of measure, categories, and more.',
                'screenshots' => [
                    [
                        'image' => 'admin-settings.jpg',
                        'caption' => 'System Settings — General',
                        'callouts' => [
                            ['n' => 1, 'title' => 'UOM Options', 'text' => 'Units of measure available when creating materials or products, e.g. Meters, Boxes, Rolls.'],
                            ['n' => 2, 'title' => 'Danger Zone', 'text' => 'Destructive operations, including the factory reset used for demo data.'],
                            ['n' => 3, 'title' => 'Company Information', 'text' => 'Name, email, and default currency used across invoices, reports, and receipts.'],
                            ['n' => 4, 'title' => 'Company Logo', 'text' => 'Shown on printed documents like invoices.'],
                            ['n' => 5, 'title' => 'Save Settings', 'text' => 'Applies changes made on this tab.'],
                        ],
                    ],
                ],
                'tips' => [
                    'Categories and Attributes here feed the dropdowns used throughout Inventory, Pricing, and Orders — set these up before relying on them elsewhere.',
                ],
            ],
        ];
    }
}
