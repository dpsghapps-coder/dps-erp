import {
    forwardRef,
    InputHTMLAttributes,
    useEffect,
    useImperativeHandle,
    useRef,
} from 'react';

export default forwardRef(function TextInput(
    {
        type = 'text',
        className = '',
        isFocused = false,
        ...props
    }: InputHTMLAttributes<HTMLInputElement> & { isFocused?: boolean },
    ref,
) {
    const localRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-lg border border-slate-300 bg-white text-slate-900 shadow-sm placeholder-slate-400 transition-colors focus:border-[#8b0f0c] focus:outline-none focus:ring-2 focus:ring-[#8b0f0c]/20 dark:border-white/[0.08] dark:bg-[#12151e]/60 dark:text-slate-100 dark:placeholder-slate-500 ' +
                className
            }
            ref={localRef}
        />
    );
});
