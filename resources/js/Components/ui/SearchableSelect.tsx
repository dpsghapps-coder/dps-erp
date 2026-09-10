import { useState } from 'react';
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { ChevronsUpDown, Check } from 'lucide-react';

interface SearchableSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
    className?: string;
}

export function SearchableSelect({ value, onChange, options, placeholder, className }: SearchableSelectProps) {
    const [query, setQuery] = useState('');

    const filtered = query === ''
        ? options
        : options.filter((option) => option.toLowerCase().includes(query.toLowerCase()));

    return (
        <Combobox value={value} onChange={(val) => onChange(val ?? '')} onClose={() => setQuery('')}>
            <div className="relative">
                <ComboboxInput
                    className={className ?? 'glass-input w-full'}
                    displayValue={(val: string) => val}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    autoComplete="off"
                />
                <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronsUpDown className="w-4 h-4 text-slate-400" />
                </ComboboxButton>
                <ComboboxOptions
                    anchor="bottom start"
                    className="z-50 w-[var(--input-width)] max-h-60 overflow-y-auto rounded-xl bg-white dark:bg-[#1a1e2a] shadow-lg border border-slate-200 dark:border-white/10 mt-1 py-1 empty:invisible"
                >
                    {filtered.length === 0 && query !== '' ? (
                        <div className="px-4 py-2 text-sm text-slate-400">No matches</div>
                    ) : (
                        filtered.map((option) => (
                            <ComboboxOption
                                key={option}
                                value={option}
                                className="relative cursor-pointer select-none py-2 pl-9 pr-4 text-sm data-[focus]:bg-indigo-50 dark:data-[focus]:bg-indigo-500/10 data-[focus]:text-indigo-700 dark:data-[focus]:text-indigo-300"
                            >
                                {({ selected }) => (
                                    <>
                                        {selected && (
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-indigo-600">
                                                <Check className="w-4 h-4" />
                                            </span>
                                        )}
                                        {option}
                                    </>
                                )}
                            </ComboboxOption>
                        ))
                    )}
                </ComboboxOptions>
            </div>
        </Combobox>
    );
}
