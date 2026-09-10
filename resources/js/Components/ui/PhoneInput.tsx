import { useState } from 'react';
import Swal from 'sweetalert2';

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    className?: string;
}

function normalizeGhanaPhone(raw: string): string {
    let cleaned = raw.replace(/[\s-]/g, '');
    if (cleaned.startsWith('+233')) {
        cleaned = '0' + cleaned.slice(4);
    } else if (cleaned.startsWith('233')) {
        cleaned = '0' + cleaned.slice(3);
    }
    return cleaned;
}

function warnInvalidGhanaNumber() {
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'warning',
        title: 'Phone number should be 10 digits starting with 0 (e.g. 0244123456)',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
    });
}

export function PhoneInput({ value, onChange, error, className }: PhoneInputProps) {
    const [international, setInternational] = useState(() => value.trim().startsWith('+'));

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        if (international) return;
        e.preventDefault();
        onChange(normalizeGhanaPhone(e.clipboardData.getData('text')));
    };

    const handleBlur = () => {
        if (international || !value) return;
        const normalized = normalizeGhanaPhone(value);
        if (normalized !== value) {
            onChange(normalized);
        }
        if (!/^0[0-9]{9}$/.test(normalized)) {
            warnInvalidGhanaNumber();
        }
    };

    return (
        <div>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onPaste={handlePaste}
                onBlur={handleBlur}
                maxLength={international ? 20 : 10}
                placeholder={international ? '+XX XXX XXX XXXX' : '0XXXXXXXXX'}
                className={className ?? 'glass-input w-full'}
            />
            <div className="flex items-center justify-between gap-2 mt-1">
                <p className="text-xs text-slate-400">
                    {international ? 'International format, e.g. +86 195 8476 1373' : '10 digits starting with 0'}
                </p>
                <button
                    type="button"
                    onClick={() => {
                        setInternational((prev) => !prev);
                        onChange('');
                    }}
                    className="text-xs text-indigo-500 hover:underline whitespace-nowrap flex-shrink-0"
                >
                    {international ? 'Use Ghana number' : '+ Add international number'}
                </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}
