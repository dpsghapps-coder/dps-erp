import { Head, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    Building2, Sparkles, FileText, UserCog, DollarSign, Package, Users, CheckCircle2,
    ArrowRight, ArrowLeft, Plus, X, Loader2, Upload, ImageOff,
} from 'lucide-react';

const CURRENCIES = [
    { value: 'GHS', label: 'GHS — Ghana Cedis' },
    { value: 'USD', label: 'USD — US Dollar' },
    { value: 'EUR', label: 'EUR — Euro' },
    { value: 'GBP', label: 'GBP — British Pound' },
    { value: 'NGN', label: 'NGN — Nigerian Naira' },
];

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const FISCAL_YEAR_OPTIONS = MONTHS.map((label, i) => ({
    value: `${String(i + 1).padStart(2, '0')}-01`,
    label: `${label} 1`,
}));

const UOM_GROUPS: { group: string; options: string[] }[] = [
    { group: 'Count', options: ['Pieces', 'Units', 'Dozen', 'Pack', 'Box', 'Roll', 'Sheet', 'Ream', 'Set'] },
    { group: 'Length', options: ['Millimeters (mm)', 'Centimeters (cm)', 'Meters (m)', 'Inches (in)', 'Feet (ft)', 'Yards (yd)'] },
    { group: 'Area', options: ['Square Millimeters (mm²)', 'Square Centimeters (cm²)', 'Square Meters (m²)', 'Square Inches (in²)', 'Square Feet (ft²)', 'Square Yards (yd²)'] },
    { group: 'Weight', options: ['Grams (g)', 'Kilograms (kg)', 'Ounces (oz)', 'Pounds (lb)'] },
    { group: 'Volume', options: ['Milliliters (ml)', 'Liters (L)', 'Gallons (gal)'] },
];

const STANDARD_DEPARTMENTS = [
    'Sales & Marketing', 'Design / Creative', 'Production', 'Procurement',
    'Finance / Accounts', 'Human Resources', 'Customer Service', 'Administration',
    'Warehouse / Inventory', 'Quality Control', 'IT / Systems', 'Management',
];

function SelectableChips({ label, hint, groups, items, onToggle, onAdd, onRemove, placeholder }: {
    label: string;
    hint?: string;
    groups: { group: string; options: string[] }[];
    items: string[];
    onToggle: (value: string) => void;
    onAdd: (value: string) => void;
    onRemove: (index: number) => void;
    placeholder: string;
}) {
    const [customValue, setCustomValue] = useState('');
    const catalogValues = useMemo(() => new Set(groups.flatMap((g) => g.options)), [groups]);
    const customItems = items.filter((i) => !catalogValues.has(i));

    const addCustom = () => {
        if (customValue.trim()) {
            onAdd(customValue.trim());
            setCustomValue('');
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">{label}</label>
            {hint && <p className="text-xs text-slate-500 mb-2">{hint}</p>}
            <div className="space-y-3">
                {groups.map((g) => (
                    <div key={g.group}>
                        <p className="text-xs font-medium text-slate-400 uppercase mb-1.5">{g.group}</p>
                        <div className="flex flex-wrap gap-2">
                            {g.options.map((opt) => {
                                const selected = items.includes(opt);
                                return (
                                    <button
                                        type="button"
                                        key={opt}
                                        onClick={() => onToggle(opt)}
                                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                                            selected
                                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                    >
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-2 mt-4 mb-2">
                <input
                    type="text"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
                    placeholder={placeholder}
                    className="glass-input flex-1"
                />
                <button type="button" onClick={addCustom} className="glass-button flex items-center gap-1 px-3">
                    <Plus className="w-4 h-4" /> Add
                </button>
            </div>
            {customItems.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {customItems.map((item) => (
                        <span key={item} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm">
                            {item}
                            <button type="button" onClick={() => onRemove(items.indexOf(item))} className="text-indigo-400 hover:text-indigo-700">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

function ChipList({ label, hint, items, onAdd, onRemove, placeholder }: {
    label: string;
    hint?: string;
    items: string[];
    onAdd: (value: string) => void;
    onRemove: (index: number) => void;
    placeholder: string;
}) {
    const [value, setValue] = useState('');

    const add = () => {
        if (value.trim()) {
            onAdd(value.trim());
            setValue('');
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">{label}</label>
            {hint && <p className="text-xs text-slate-500 mb-2">{hint}</p>}
            <div className="flex gap-2 mb-3">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
                    placeholder={placeholder}
                    className="glass-input flex-1"
                />
                <button type="button" onClick={add} className="glass-button flex items-center gap-1 px-3">
                    <Plus className="w-4 h-4" /> Add
                </button>
            </div>
            {items.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {items.map((item, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm">
                            {item}
                            <button type="button" onClick={() => onRemove(i)} className="text-indigo-400 hover:text-indigo-700">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Setup() {
    const { timezones } = usePage().props as any;
    const { data, setData, post, processing, errors } = useForm({
        data_mode: '' as 'demo' | 'clean' | '',
        admin_name: '',
        admin_email: '',
        admin_password: '',
        admin_password_confirmation: '',
        company_name: '',
        company_email: '',
        company_phone: '',
        company_address: '',
        company_logo: null as File | null,
        currency: 'GHS',
        timezone: 'UTC',
        date_format: 'Y-m-d',
        fiscal_year_start: '01-01',
        uoms: [] as string[],
        categories: [] as string[],
        departments: [] as string[],
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const handleLogoChange = (file: File | null) => {
        setData('company_logo', file);
        if (file) {
            setLogoPreview(URL.createObjectURL(file));
        } else {
            setLogoPreview(null);
        }
    };

    const timezoneGroups = useMemo(() => {
        const list: string[] = timezones || Intl.supportedValuesOf?.('timeZone') || ['UTC'];
        const groups: Record<string, string[]> = {};
        list.forEach((tz) => {
            const [region, ...rest] = tz.split('/');
            const key = rest.length ? region : 'Other';
            groups[key] = groups[key] || [];
            groups[key].push(tz);
        });
        return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
    }, [timezones]);

    const [stepIndex, setStepIndex] = useState(0);

    const steps = useMemo(() => {
        const base = [
            { key: 'welcome', label: 'Start', icon: Sparkles },
            { key: 'admin', label: 'Admin Account', icon: UserCog },
            { key: 'company', label: 'Company Info', icon: Building2 },
            { key: 'regional', label: 'Currency', icon: DollarSign },
        ];
        if (data.data_mode === 'clean') {
            base.push(
                { key: 'catalog', label: 'Catalog Basics', icon: Package },
                { key: 'departments', label: 'Departments', icon: Users },
            );
        }
        base.push({ key: 'review', label: 'Finish', icon: CheckCircle2 });
        return base;
    }, [data.data_mode]);

    const current = steps[stepIndex]?.key;

    const canProceed = (): boolean => {
        switch (current) {
            case 'welcome':
                return data.data_mode !== '';
            case 'admin':
                return !!data.admin_name && !!data.admin_email && data.admin_password.length >= 8 && data.admin_password === data.admin_password_confirmation;
            case 'company':
                return !!data.company_name;
            case 'regional':
                return !!data.currency;
            default:
                return true;
        }
    };

    const goNext = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1));
    const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/setup');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Head title="Set Up Your Business" />
            <div className="w-full max-w-2xl">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-900">Welcome to DPS-ERP</h1>
                    <p className="text-slate-500 mt-1">Let's get your business set up.</p>
                </div>

                {/* Progress */}
                <div className="flex items-center justify-between mb-6 px-2">
                    {steps.map((s, i) => (
                        <div key={s.key} className="flex items-center flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${
                                i <= stepIndex ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
                            }`}>
                                <s.icon className="w-4 h-4" />
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`h-px flex-1 mx-1 ${i < stepIndex ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                            )}
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <form onSubmit={handleSubmit}>
                        {current === 'welcome' && (
                            <div>
                                <h2 className="text-lg font-semibold mb-1">How would you like to start?</h2>
                                <p className="text-sm text-slate-500 mb-4">You can always add or change data later.</p>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setData('data_mode', 'demo')}
                                        className={`text-left p-4 rounded-xl border-2 transition-colors ${data.data_mode === 'demo' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}
                                    >
                                        <Sparkles className="w-5 h-5 text-indigo-600 mb-2" />
                                        <p className="font-medium">Start with sample data</p>
                                        <p className="text-xs text-slate-500 mt-1">Pre-loaded clients, orders, products, inventory and more — great for showcasing to potential clients.</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setData('data_mode', 'clean')}
                                        className={`text-left p-4 rounded-xl border-2 transition-colors ${data.data_mode === 'clean' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}
                                    >
                                        <FileText className="w-5 h-5 text-indigo-600 mb-2" />
                                        <p className="font-medium">Start clean</p>
                                        <p className="text-xs text-slate-500 mt-1">Empty system with just your business configuration — ready for real data.</p>
                                    </button>
                                </div>
                            </div>
                        )}

                        {current === 'admin' && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold mb-1">Create your administrator account</h2>
                                <p className="text-sm text-slate-500 mb-4">This is the account you'll use to log in and manage everything.</p>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                                    <input type="text" value={data.admin_name} onChange={(e) => setData('admin_name', e.target.value)} className="glass-input w-full" />
                                    {errors.admin_name && <p className="text-red-500 text-sm mt-1">{errors.admin_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email *</label>
                                    <input type="email" value={data.admin_email} onChange={(e) => setData('admin_email', e.target.value)} className="glass-input w-full" />
                                    {errors.admin_email && <p className="text-red-500 text-sm mt-1">{errors.admin_email}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Password *</label>
                                        <input type="password" value={data.admin_password} onChange={(e) => setData('admin_password', e.target.value)} className="glass-input w-full" autoComplete="new-password" />
                                        <p className="text-xs text-slate-400 mt-1">At least 8 characters</p>
                                        {errors.admin_password && <p className="text-red-500 text-sm mt-1">{errors.admin_password}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Confirm Password *</label>
                                        <input type="password" value={data.admin_password_confirmation} onChange={(e) => setData('admin_password_confirmation', e.target.value)} className="glass-input w-full" autoComplete="new-password" />
                                        {data.admin_password && data.admin_password_confirmation && data.admin_password !== data.admin_password_confirmation && (
                                            <p className="text-red-500 text-sm mt-1">Passwords don't match</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {current === 'company' && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold mb-1">Company information</h2>
                                <p className="text-sm text-slate-500 mb-4">Used across the app on documents and reports.</p>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Company Name *</label>
                                    <input type="text" value={data.company_name} onChange={(e) => setData('company_name', e.target.value)} className="glass-input w-full" />
                                    {errors.company_name && <p className="text-red-500 text-sm mt-1">{errors.company_name}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Company Email</label>
                                        <input type="email" value={data.company_email} onChange={(e) => setData('company_email', e.target.value)} className="glass-input w-full" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Company Phone</label>
                                        <input type="text" value={data.company_phone} onChange={(e) => setData('company_phone', e.target.value)} className="glass-input w-full" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Company Address</label>
                                    <textarea value={data.company_address} onChange={(e) => setData('company_address', e.target.value)} className="glass-input w-full h-20" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Company Logo</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-lg border border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50 shrink-0">
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                                            ) : (
                                                <ImageOff className="w-5 h-5 text-slate-300" />
                                            )}
                                        </div>
                                        <label className="glass-button-secondary flex items-center gap-2 cursor-pointer">
                                            <Upload className="w-4 h-4" /> {logoPreview ? 'Change logo' : 'Upload logo'}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleLogoChange(e.target.files?.[0] || null)}
                                            />
                                        </label>
                                        {logoPreview && (
                                            <button type="button" onClick={() => handleLogoChange(null)} className="text-sm text-slate-400 hover:text-red-500">
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">Optional — PNG or JPG, up to 2MB. You can change this later in Admin → Settings.</p>
                                    {errors.company_logo && <p className="text-red-500 text-sm mt-1">{errors.company_logo}</p>}
                                </div>
                            </div>
                        )}

                        {current === 'regional' && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold mb-1">Currency & regional settings</h2>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Currency *</label>
                                    <select value={data.currency} onChange={(e) => setData('currency', e.target.value)} className="glass-input w-full">
                                        {CURRENCIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Timezone</label>
                                        <select value={data.timezone} onChange={(e) => setData('timezone', e.target.value)} className="glass-input w-full">
                                            {timezoneGroups.map(([region, zones]) => (
                                                <optgroup key={region} label={region}>
                                                    {zones.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Date Format</label>
                                        <select value={data.date_format} onChange={(e) => setData('date_format', e.target.value)} className="glass-input w-full">
                                            <option value="Y-m-d">YYYY-MM-DD</option>
                                            <option value="d/m/Y">DD/MM/YYYY</option>
                                            <option value="m/d/Y">MM/DD/YYYY</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Fiscal Year Start</label>
                                    <select value={data.fiscal_year_start} onChange={(e) => setData('fiscal_year_start', e.target.value)} className="glass-input w-full">
                                        {FISCAL_YEAR_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}

                        {current === 'catalog' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold mb-1">Catalog basics</h2>
                                    <p className="text-sm text-slate-500 mb-4">Optional — you can add more anytime from Admin → Settings.</p>
                                </div>
                                <SelectableChips
                                    label="Units of Measure"
                                    hint="Select the ones you use, or add your own below."
                                    groups={UOM_GROUPS}
                                    items={data.uoms}
                                    onToggle={(v) => setData('uoms', data.uoms.includes(v) ? data.uoms.filter((i) => i !== v) : [...data.uoms, v])}
                                    onAdd={(v) => setData('uoms', [...data.uoms, v])}
                                    onRemove={(i) => setData('uoms', data.uoms.filter((_, idx) => idx !== i))}
                                    placeholder="Add a custom unit of measure"
                                />
                                <ChipList
                                    label="Product Categories"
                                    hint="e.g. Apparel, Accessories"
                                    items={data.categories}
                                    onAdd={(v) => setData('categories', [...data.categories, v])}
                                    onRemove={(i) => setData('categories', data.categories.filter((_, idx) => idx !== i))}
                                    placeholder="Add a category"
                                />
                            </div>
                        )}

                        {current === 'departments' && (
                            <div>
                                <h2 className="text-lg font-semibold mb-1">Departments</h2>
                                <p className="text-sm text-slate-500 mb-4">Optional — needed before adding employees in HRM. You can add these later too.</p>
                                <SelectableChips
                                    label="Departments"
                                    hint="Select the ones you use, or add your own below."
                                    groups={[{ group: 'Standard Departments', options: STANDARD_DEPARTMENTS }]}
                                    items={data.departments}
                                    onToggle={(v) => setData('departments', data.departments.includes(v) ? data.departments.filter((i) => i !== v) : [...data.departments, v])}
                                    onAdd={(v) => setData('departments', [...data.departments, v])}
                                    onRemove={(i) => setData('departments', data.departments.filter((_, idx) => idx !== i))}
                                    placeholder="Add a custom department"
                                />
                            </div>
                        )}

                        {current === 'review' && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold mb-1">Review & finish</h2>
                                <p className="text-sm text-slate-500 mb-4">Double-check everything, then complete setup.</p>
                                <div className="space-y-2 text-sm bg-slate-50 rounded-lg p-4">
                                    <div className="flex justify-between"><span className="text-slate-500">Data mode</span><span className="font-medium">{data.data_mode === 'demo' ? 'Sample data' : 'Clean start'}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">Administrator</span><span className="font-medium">{data.admin_name} ({data.admin_email})</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">Company</span><span className="font-medium">{data.company_name}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">Currency</span><span className="font-medium">{data.currency}</span></div>
                                    {data.data_mode === 'clean' && (
                                        <>
                                            <div className="flex justify-between"><span className="text-slate-500">UOMs</span><span className="font-medium">{data.uoms.length ? data.uoms.join(', ') : '—'}</span></div>
                                            <div className="flex justify-between"><span className="text-slate-500">Categories</span><span className="font-medium">{data.categories.length ? data.categories.join(', ') : '—'}</span></div>
                                            <div className="flex justify-between"><span className="text-slate-500">Departments</span><span className="font-medium">{data.departments.length ? data.departments.join(', ') : '—'}</span></div>
                                        </>
                                    )}
                                </div>
                                {errors.data_mode && <p className="text-red-500 text-sm">{errors.data_mode}</p>}
                            </div>
                        )}

                        <div className="flex justify-between mt-6 pt-6 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={goBack}
                                disabled={stepIndex === 0}
                                className="glass-button-secondary flex items-center gap-2 disabled:opacity-0"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                            {current === 'review' ? (
                                <button type="submit" disabled={processing} className="glass-button flex items-center gap-2">
                                    {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Setting up...</> : <>Complete Setup <CheckCircle2 className="w-4 h-4" /></>}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={goNext}
                                    disabled={!canProceed()}
                                    className="glass-button flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next <ArrowRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
