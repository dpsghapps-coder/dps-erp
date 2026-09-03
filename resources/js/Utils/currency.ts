import { usePage } from '@inertiajs/react';

const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: '$',
    GHS: 'GH₵',
    EUR: '€',
    GBP: '£',
    NGN: '₦',
};

export const formatCurrency = (amount: number | string, currencyCode?: string): string => {
    const code = currencyCode || 'GHS';
    const num = parseFloat(amount as string) || 0;
    const formattedNum = num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const symbol = CURRENCY_SYMBOLS[code];
    if (symbol) {
        return `${symbol} ${formattedNum}`;
    }

    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: code,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    } catch {
        return `${code} ${formattedNum}`;
    }
};

export const useCurrency = (): ((amount: number | string) => string) => {
    const props = usePage().props as any;
    const currency: string = props.currency || 'GHS';
    return (amount: number | string) => formatCurrency(amount, currency);
};

export const useCurrencySymbol = (): string => {
    const props = usePage().props as any;
    const code: string = props.currency || 'GHS';
    return CURRENCY_SYMBOLS[code] || code;
};
