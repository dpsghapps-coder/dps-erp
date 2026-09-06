import { ButtonHTMLAttributes } from 'react';

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#8b0f0c]/40 focus:ring-offset-2 dark:focus:ring-offset-[#13161f] ${
                    disabled && 'opacity-50 hover:translate-y-0 hover:shadow-md'
                } ` + className
            }
            style={{
                background: 'linear-gradient(135deg, #8b0f0c, #b3241c)',
            }}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
