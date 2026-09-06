<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Payslip {{ $payroll->month }} - {{ $payroll->employee->full_name }}</title>
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
        .employee-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 12px; margin-bottom: 16px; }
        .employee-box .label { text-transform: uppercase; font-size: 9px; color: #64748b; letter-spacing: 0.5px; }
        .employee-box .name { font-size: 13px; font-weight: bold; margin-top: 2px; }
        table.breakdown { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        table.breakdown th { text-align: left; font-size: 10px; text-transform: uppercase; border-bottom: 2px solid #1e293b; padding: 6px 4px; }
        table.breakdown td { padding: 6px 4px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
        table.breakdown td.right, table.breakdown th.right { text-align: right; }
        .two-col { width: 100%; }
        .two-col td { width: 50%; vertical-align: top; padding-right: 12px; }
        .net-pay { background: #eef2ff; border: 1px solid #c7d2fe; padding: 12px; margin-top: 10px; text-align: right; }
        .net-pay .label { text-transform: uppercase; font-size: 10px; color: #4338ca; }
        .net-pay .amount { font-size: 20px; font-weight: bold; color: #3730a3; }
        .footer { margin-top: 30px; font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px; }
    </style>
</head>
<body>
    <table class="header">
        <tr>
            <td style="width: 60%;">
                <div class="company-name">DP Solutions Ghana Limited</div>
                <div class="tagline">Total Printing Solutions</div>
            </td>
            <td style="width: 40%;">
                <div class="doc-title">PAYSLIP</div>
                <div class="doc-meta">
                    <div><strong>Pay Period:</strong> {{ \Carbon\Carbon::parse($payroll->month)->format('F Y') }}</div>
                    @if($payroll->payment_date)
                        <div><strong>Payment Date:</strong> {{ $payroll->payment_date->format('d M Y') }}</div>
                    @endif
                    <div><strong>Status:</strong> {{ ucfirst($payroll->status) }}</div>
                </div>
            </td>
        </tr>
    </table>

    <div class="employee-box">
        <div class="label">Employee</div>
        <div class="name">{{ $payroll->employee->full_name }}</div>
        <div class="muted">
            {{ $payroll->employee->employee_number }}
            @if($payroll->employee->department) &middot; {{ $payroll->employee->department->name }} @endif
            @if($payroll->employee->job_title) &middot; {{ $payroll->employee->job_title }} @endif
        </div>
    </div>

    <table class="two-col">
        <tr>
            <td>
                <table class="breakdown">
                    <thead>
                        <tr><th colspan="2">Earnings</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>Basic Salary</td><td class="right">{{ $currencySymbol }} {{ number_format($payroll->basic_salary, 2) }}</td></tr>
                        <tr><td>Allowances</td><td class="right">{{ $currencySymbol }} {{ number_format($payroll->allowances, 2) }}</td></tr>
                        <tr><td>Overtime</td><td class="right">{{ $currencySymbol }} {{ number_format($payroll->overtime, 2) }}</td></tr>
                        <tr><td>Bonuses</td><td class="right">{{ $currencySymbol }} {{ number_format($payroll->bonuses, 2) }}</td></tr>
                        <tr><td><strong>Gross Pay</strong></td><td class="right"><strong>{{ $currencySymbol }} {{ number_format($payroll->gross_pay, 2) }}</strong></td></tr>
                    </tbody>
                </table>
            </td>
            <td>
                <table class="breakdown">
                    <thead>
                        <tr><th colspan="2">Deductions</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>Tax (PAYE)</td><td class="right">{{ $currencySymbol }} {{ number_format($payroll->deductions_tax, 2) }}</td></tr>
                        <tr><td>Insurance</td><td class="right">{{ $currencySymbol }} {{ number_format($payroll->deductions_insurance, 2) }}</td></tr>
                        <tr><td>Retirement</td><td class="right">{{ $currencySymbol }} {{ number_format($payroll->deductions_retirement, 2) }}</td></tr>
                        <tr><td>Other</td><td class="right">{{ $currencySymbol }} {{ number_format($payroll->deductions_other, 2) }}</td></tr>
                        <tr>
                            <td><strong>Total Deductions</strong></td>
                            <td class="right">
                                <strong>{{ $currencySymbol }} {{ number_format($payroll->deductions_tax + $payroll->deductions_insurance + $payroll->deductions_retirement + $payroll->deductions_other, 2) }}</strong>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    </table>

    <div class="net-pay">
        <div class="label">Net Pay</div>
        <div class="amount">{{ $currencySymbol }} {{ number_format($payroll->net_pay, 2) }}</div>
    </div>

    <div class="footer">
        This is a system-generated payslip. Generated on {{ now()->format('d M Y, H:i') }}.
    </div>
</body>
</html>
