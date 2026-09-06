import { InputHTMLAttributes } from 'react';

export default function Checkbox({
    className = '',
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-slate-300 text-[#8b0f0c] shadow-sm focus:ring-[#8b0f0c]/40 dark:border-white/[0.15] dark:bg-[#12151e] ' +
                className
            }
        />
    );
}
