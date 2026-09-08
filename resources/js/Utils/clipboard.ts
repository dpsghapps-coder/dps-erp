/**
 * navigator.clipboard requires a secure context (HTTPS or localhost) and is
 * unavailable on plain-HTTP origins like a LAN IP — falls back to the
 * older execCommand approach there.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            // fall through to legacy approach
        }
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    let succeeded = false;
    try {
        succeeded = document.execCommand('copy');
    } catch {
        succeeded = false;
    }

    document.body.removeChild(textarea);
    return succeeded;
}
