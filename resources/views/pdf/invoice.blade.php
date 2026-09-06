<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $invoice->invoice_number }}</title>
    <style>
        @page { margin: 30px 36px; }
        body { font-family: Helvetica, Arial, sans-serif; font-size: 11px; color: #1e293b; }
        .header { width: 100%; margin-bottom: 18px; }
        .header td { vertical-align: top; }
        .company-name { font-size: 18px; font-weight: bold; color: #1e293b; }
        .tagline { font-size: 10px; color: #64748b; font-style: italic; margin-top: 2px; }
        .muted { color: #64748b; }
        .doc-title { font-size: 22px; font-weight: bold; color: #4f46e5; text-align: right; }
        .doc-meta { text-align: right; font-size: 11px; margin-top: 6px; }
        .doc-meta div { margin-bottom: 2px; }
        .bill-to { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 12px; margin-bottom: 16px; }
        .bill-to .label { text-transform: uppercase; font-size: 9px; color: #64748b; letter-spacing: 0.5px; }
        .bill-to .name { font-size: 13px; font-weight: bold; margin-top: 2px; }
        table.items { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        table.items th { text-align: left; font-size: 10px; text-transform: uppercase; border-bottom: 2px solid #1e293b; padding: 6px 4px; }
        table.items td { padding: 7px 4px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
        table.items th.right, table.items td.right { text-align: right; }
        table.items th.center, table.items td.center { text-align: center; }
        .totals { width: 260px; float: right; margin-bottom: 16px; }
        .totals table { width: 100%; border-collapse: collapse; }
        .totals td { padding: 4px 0; font-size: 11px; }
        .totals .right { text-align: right; }
        .totals .grand { border-top: 2px solid #1e293b; font-weight: bold; font-size: 13px; }
        .status { display: inline-block; padding: 3px 10px; border-radius: 10px; font-size: 10px; text-transform: uppercase; }
        .status-paid { background: #d1fae5; color: #065f46; }
        .status-partially_paid { background: #fef3c7; color: #92400e; }
        .status-sent { background: #dbeafe; color: #1e40af; }
        .status-draft { background: #f1f5f9; color: #475569; }
        .status-cancelled { background: #fee2e2; color: #991b1b; }
        .footer { margin-top: 30px; font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        .clear { clear: both; }
    </style>
</head>
<body>
    <table class="header">
        <tr>
            <td style="width: 60%;">
                <div class="company-name">DP Solutions Ghana Limited</div>
                <div class="tagline">Total Printing Solutions</div>
                <div class="muted" style="margin-top: 6px;">
                    dpsolutionsghana@gmail.com<br>
                    0245959796
                </div>
            </td>
            <td style="width: 40%;">
                <div class="doc-title">INVOICE</div>
                <div class="doc-meta">
                    <div><strong>No:</strong> {{ $invoice->invoice_number }}</div>
                    <div><strong>Date:</strong> {{ $invoice->invoice_date->format('d M Y') }}</div>
                    <div><strong>Due:</strong> {{ $invoice->due_date->format('d M Y') }}</div>
                    <div style="margin-top: 4px;">
                        <span class="status status-{{ $invoice->status }}">{{ ucwords(str_replace('_', ' ', $invoice->status)) }}</span>
                    </div>
                </div>
            </td>
        </tr>
    </table>

    <div class="bill-to">
        <div class="label">Bill To</div>
        <div class="name">{{ $invoice->client->company_name }}</div>
        @if($invoice->client->phone)
            <div class="muted">{{ $invoice->client->phone }}</div>
        @endif
        @if(collect([$invoice->client->address, $invoice->client->city, $invoice->client->country])->filter()->isNotEmpty())
            <div class="muted">{{ collect([$invoice->client->address, $invoice->client->city, $invoice->client->country])->filter()->implode(', ') }}</div>
        @endif
    </div>

    <table class="items">
        <thead>
            <tr>
                <th style="width: 24px;">#</th>
                <th>Description</th>
                <th class="center" style="width: 60px;">Qty</th>
                <th class="right" style="width: 80px;">Unit Price</th>
                <th class="right" style="width: 90px;">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($invoice->items as $i => $item)
                <tr>
                    <td class="muted">{{ $i + 1 }}</td>
                    <td>{{ $item->description }}</td>
                    <td class="center">{{ rtrim(rtrim(number_format($item->quantity, 2), '0'), '.') }}</td>
                    <td class="right">{{ number_format($item->unit_price, 2) }}</td>
                    <td class="right">{{ number_format($item->line_total, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals">
        <table>
            <tr>
                <td class="muted">Subtotal</td>
                <td class="right">{{ $currencySymbol }} {{ number_format($invoice->subtotal, 2) }}</td>
            </tr>
            <tr>
                <td class="muted">Amount Paid</td>
                <td class="right">{{ $currencySymbol }} {{ number_format($invoice->amount_paid, 2) }}</td>
            </tr>
            <tr class="grand">
                <td>Balance Due</td>
                <td class="right">{{ $currencySymbol }} {{ number_format($invoice->balance, 2) }}</td>
            </tr>
        </table>
    </div>
    <div class="clear"></div>

    @if($invoice->notes)
        <div style="margin-top: 10px;">
            <strong>Notes</strong>
            <div class="muted">{{ $invoice->notes }}</div>
        </div>
    @endif

    <div class="footer">
        Thank you for your business. Generated on {{ now()->format('d M Y, H:i') }}.
    </div>
</body>
</html>
