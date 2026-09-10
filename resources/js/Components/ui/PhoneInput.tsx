import { useState } from 'react';

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    className?: string;
}

export function PhoneInput({ value, onChange, error, className }: PhoneInputProps) {
    const [international, setInternational] = useState(() => value.trim().startsWith('+'));

    return (
        <div>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
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
