<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Purchase Order {{ $po->po_number }}</title>
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
        .supplier-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 12px; margin-bottom: 16px; }
        .supplier-box .label { text-transform: uppercase; font-size: 9px; color: #64748b; letter-spacing: 0.5px; }
        .supplier-box .name { font-size: 13px; font-weight: bold; margin-top: 2px; }
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
        .status-draft { background: #f1f5f9; color: #475569; }
        .status-ordered { background: #dbeafe; color: #1e40af; }
        .status-purchased { background: #fef3c7; color: #92400e; }
        .status-inspected { background: #ede9fe; color: #5b21b6; }
        .status-closed { background: #d1fae5; color: #065f46; }
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
                <div class="doc-title">PURCHASE ORDER</div>
                <div class="doc-meta">
                    <div><strong>No:</strong> {{ $po->po_number }}</div>
                    <div><strong>Date:</strong> {{ $po->created_at->format('d M Y') }}</div>
                    @if($po->expected_date)
                        <div><strong>Expected:</strong> {{ $po->expected_date->format('d M Y') }}</div>
                    @endif
                    <div style="margin-top: 4px;">
                        <span class="status status-{{ $po->status }}">{{ ucwords(str_replace('_', ' ', $po->status)) }}</span>
                    </div>
                </div>
            </td>
        </tr>
    </table>

    <div class="supplier-box">
        <div class="label">Supplier</div>
        <div class="name">{{ $po->supplier->company_name }}</div>
        @php($branch = $po->supplier->branches->first())
        @if($branch?->contact_name)
            <div class="muted">Attn: {{ $branch->contact_name }}</div>
        @endif
        @if($branch?->mobile)
            <div class="muted">{{ $branch->mobile }}</div>
        @endif
        @if($branch?->address)
            <div class="muted">{{ $branch->address }}</div>
        @endif
    </div>

    <table class="items">
        <thead>
            <tr>
                <th style="width: 24px;">#</th>
                <th>Item</th>
                <th class="center" style="width: 60px;">Qty</th>
                <th class="right" style="width: 90px;">Unit Cost</th>
                <th class="right" style="width: 90px;">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($po->items as $i => $item)
                <tr>
                    <td class="muted">{{ $i + 1 }}</td>
                    <td>{{ $item->display_name }}</td>
                    <td class="center">{{ rtrim(rtrim(number_format($item->qty, 2), '0'), '.') }}</td>
                    <td class="right">{{ $currencySymbol }} {{ number_format($item->unit_cost, 2) }}</td>
                    <td class="right">{{ $currencySymbol }} {{ number_format($item->line_total, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals">
        <table>
            <tr class="grand">
                <td>Total</td>
                <td class="right">{{ $currencySymbol }} {{ number_format($po->total_amount, 2) }}</td>
            </tr>
        </table>
    </div>
    <div class="clear"></div>

    @if($po->notes)
        <div style="margin-top: 10px;">
            <strong>Notes</strong>
            <div class="muted">{{ $po->notes }}</div>
        </div>
    @endif

    <div class="footer">
        Generated on {{ now()->format('d M Y, H:i') }}.
    </div>
</body>
</html>
