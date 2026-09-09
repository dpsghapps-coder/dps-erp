<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, Segoe UI, Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; padding: 24px; background: #f8fafc;">
    <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
        <h2 style="margin: 0 0 16px;">Database Backup — {{ config('app.name') }}</h2>
        <p style="line-height: 1.6;">A scheduled database backup was created on {{ now()->format('F j, Y \a\t g:i A') }}.</p>
        <p style="line-height: 1.6;"><strong>Size:</strong> {{ $sizeHuman }}</p>

        @if($attached)
            <p style="line-height: 1.6;">The compressed backup is attached to this email.</p>
        @else
            <p style="line-height: 1.6;">The backup was too large to attach to this email. It's saved on the server at:</p>
            <p style="font-family: monospace; background: #f1f5f9; padding: 8px 12px; border-radius: 6px; font-size: 13px; word-break: break-all;">{{ $serverPath }}</p>
        @endif

        <p style="color: #64748b; font-size: 13px; margin-top: 32px;">This is an automated message from {{ config('app.name') }}.</p>
    </div>
</body>
</html>
