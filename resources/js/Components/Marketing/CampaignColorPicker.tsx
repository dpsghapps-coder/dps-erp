import { Check } from 'lucide-react';

export const CAMPAIGN_COLOR_PRESETS: { label: string; value: string }[] = [
    { label: 'Default', value: '' },
    { label: 'Blue', value: '#3b82f6' },
    { label: 'Purple', value: '#8b5cf6' },
    { label: 'Emerald', value: '#10b981' },
    { label: 'Amber', value: '#f59e0b' },
    { label: 'Red', value: '#ef4444' },
    { label: 'Rose', value: '#f43f5e' },
    { label: 'Teal', value: '#14b8a6' },
    { label: 'Gold', value: 'linear-gradient(135deg, #b8860b, #f9e076, #b8860b)' },
    { label: 'Silver', value: 'linear-gradient(135deg, #9ca3af, #f3f4f6, #9ca3af)' },
    { label: 'Bronze', value: 'linear-gradient(135deg, #8c5a2b, #e8a75d, #8c5a2b)' },
    { label: 'Royal Purple', value: 'linear-gradient(135deg, #5b21b6, #c4b5fd, #5b21b6)' },
];

interface CampaignColorPickerProps {
    value: string;
    onChange: (value: string) => void;
}

export function CampaignColorPicker({ value, onChange }: CampaignColorPickerProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {CAMPAIGN_COLOR_PRESETS.map((preset) => (
                <button
                    key={preset.label}
                    type="button"
                    title={preset.label}
                    onClick={() => onChange(preset.value)}
                    className={`relative w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        value === preset.value
                            ? 'border-indigo-600 scale-110'
                            : 'border-slate-200 dark:border-white/10 hover:scale-105'
                    }`}
                    style={{
                        background: preset.value || 'repeating-conic-gradient(#e5e7eb 0% 25%, #ffffff 0% 50%) 0 0 / 10px 10px',
                    }}
                >
                    {value === preset.value && (
                        <Check className={`w-4 h-4 ${preset.value ? 'text-white drop-shadow' : 'text-slate-500'}`} />
                    )}
                </button>
            ))}
        </div>
    );
}
