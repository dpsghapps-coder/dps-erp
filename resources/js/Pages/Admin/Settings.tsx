import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, DataTable } from '@/Components/ui';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, Plus, Trash2, Pencil, Package, Tag, List, X, Check, Receipt, AlertTriangle, ShieldAlert, Upload, ImageOff, Box, Wrench, Building2, Briefcase, Award, MapPin, Eye, EyeOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';

function LeaveTypeMatrix({ leaveTypes, leaveTypeNames, staffLevels }: { leaveTypes: any[]; leaveTypeNames: string[]; staffLevels: any[] }) {
    const initialMatrix = useMemo(() => {
        const m: Record<number, Record<string, string>> = {};
        staffLevels.forEach((s: any) => {
            m[s.id] = {};
            leaveTypeNames.forEach((name) => { m[s.id][name] = ''; });
        });
        leaveTypes.forEach((lt: any) => {
            if (m[lt.staff_level_id]) {
                m[lt.staff_level_id][lt.name] = String(lt.days_per_year);
            }
        });
        return m;
    }, [leaveTypes, leaveTypeNames, staffLevels]);

    const [matrix, setMatrix] = useState(initialMatrix);
    const [saving, setSaving] = useState(false);
    const errors = (usePage().props as any).errors || {};

    const setCell = (staffLevelId: number, name: string, value: string) => {
        setMatrix((prev) => ({
            ...prev,
            [staffLevelId]: { ...prev[staffLevelId], [name]: value },
        }));
    };

    const save = () => {
        const entries: { staff_level_id: number; name: string; days_per_year: number | null }[] = [];
        staffLevels.forEach((s: any) => {
            leaveTypeNames.forEach((name) => {
                const raw = matrix[s.id]?.[name] ?? '';
                entries.push({
                    staff_level_id: s.id,
                    name,
                    days_per_year: raw === '' ? null : parseInt(raw, 10),
                });
            });
        });

        setSaving(true);
        router.post('/hrm/settings/leave-types/matrix', { entries }, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setSaving(false),
        });
    };

    return (
        <div>
            <div className="overflow-x-auto -mx-2 px-2">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-white/10">
                            <th className="text-left py-2 pr-3 font-medium text-slate-500">Staff Level</th>
                            {leaveTypeNames.map((name) => (
                                <th key={name} className="text-left py-2 px-2 font-medium text-slate-500">{name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {staffLevels.map((s: any) => (
                            <tr key={s.id} className="border-b border-slate-100 dark:border-white/5">
                                <td className="py-2 pr-3 font-medium whitespace-nowrap">{s.name}</td>
                                {leaveTypeNames.map((name) => (
                                    <td key={name} className="py-2 px-2">
                                        <input
                                            type="number"
                                            min={0}
                                            placeholder="—"
                                            className="glass-input w-20"
                                            value={matrix[s.id]?.[name] ?? ''}
                                            onChange={(e) => setCell(s.id, name, e.target.value)}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {staffLevels.length === 0 && (
                            <tr><td colSpan={leaveTypeNames.length + 1} className="py-4 text-center text-slate-400">Add a staff level first.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {errors.entries && <p className="text-red-500 text-xs mt-3">{errors.entries}</p>}
            <div className="flex justify-end mt-4">
                <button onClick={save} disabled={saving || staffLevels.length === 0} className="glass-button flex items-center gap-2">
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Leave Types'}
                </button>
            </div>
        </div>
    );
}

interface LookupItem {
    id: number;
    name: string;
    is_active: boolean;
    sort_order: number;
}

function LookupListEditor({ type, title, items }: { type: string; title: string; items: LookupItem[] }) {
    const [newName, setNewName] = useState('');
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setAdding(true);
        router.post(`/crm/settings/${type}`, { name: newName.trim() }, {
            preserveScroll: true,
            onSuccess: () => setNewName(''),
            onFinish: () => setAdding(false),
        });
    };

    const startEdit = (item: LookupItem) => {
        setEditingId(item.id);
        setEditName(item.name);
    };

    const saveEdit = (item: LookupItem) => {
        if (!editName.trim()) return;
        router.put(`/crm/settings/${type}/${item.id}`, { name: editName.trim(), is_active: item.is_active }, {
            preserveScroll: true,
            onSuccess: () => setEditingId(null),
        });
    };

    const toggleActive = (item: LookupItem) => {
        router.put(`/crm/settings/${type}/${item.id}`, { name: item.name, is_active: !item.is_active }, {
            preserveScroll: true,
        });
    };

    const handleDelete = (item: LookupItem) => {
        Swal.fire({
            title: `Remove "${item.name}"?`,
            text: 'Clients already using this value keep it. This only removes it from the dropdown.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Remove',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/crm/settings/${type}/${item.id}`, { preserveScroll: true });
            }
        });
    };

    return (
        <GlassCard>
            <h2 className="text-lg font-semibold mb-4">{title}</h2>
            <form onSubmit={handleAdd} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={`Add ${title.toLowerCase()}...`}
                    className="glass-input flex-1 text-sm"
                />
                <button type="submit" disabled={adding} className="glass-button-secondary px-3">
                    <Plus className="w-4 h-4" />
                </button>
            </form>
            <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
                {items.length === 0 && <p className="text-sm text-slate-400">No entries yet.</p>}
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                        {editingId === item.id ? (
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="glass-input flex-1 text-sm py-1"
                                autoFocus
                            />
                        ) : (
                            <span className={`text-sm truncate ${item.is_active ? '' : 'text-slate-400 line-through'}`}>
                                {item.name}
                            </span>
                        )}
                        <div className="flex items-center gap-1 flex-shrink-0">
                            {editingId === item.id ? (
                                <>
                                    <button onClick={() => saveEdit(item)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded">
                                        <Save className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => startEdit(item)} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded" aria-label="Edit">
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => toggleActive(item)} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded" aria-label={item.is_active ? 'Deactivate' : 'Activate'}>
                                        {item.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                    </button>
                                    <button onClick={() => handleDelete(item)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded" aria-label="Remove">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
}

type Tab = 'general' | 'uom' | 'categories' | 'attributes' | 'extraCosts' | 'packTypes' | 'serviceCosts'
    | 'departments' | 'employmentTypes' | 'staffLevels' | 'crmLookups' | 'dangerZone';

function TabNavGroup({ label }: { label: string }) {
    return <p className="px-3 pt-3 pb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide first:pt-0">{label}</p>;
}

function TabNavButton({ active, onClick, icon: Icon, danger, children }: {
    active: boolean;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string }>;
    danger?: boolean;
    children: React.ReactNode;
}) {
    const activeClasses = danger ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white';
    const inactiveClasses = danger ? 'text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:bg-white/5 hover:text-white';

    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${active ? activeClasses : inactiveClasses}`}
        >
            {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
            <span className="truncate">{children}</span>
        </button>
    );
}

export default function Settings() {
    const page = usePage().props as any;
    const {
        uoms, categories, attributes, extraCostTypes, packTypes, serviceCostTypes,
        departments, employmentTypes, leaveTypes, leaveTypeNames, staffLevels,
        sources, industries, regions, cities, neighbourhoods,
        sectionAccess, currency: savedCurrency, companyLogo,
    } = page;
    const access = sectionAccess || { admin: false, hrm: false, crm: false, factoryReset: false };
    const [activeTab, setActiveTab] = useState<Tab>(
        access.admin ? 'general' : access.hrm ? 'departments' : access.crm ? 'crmLookups' : 'general'
    );
    const [newUom, setNewUom] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [newAttribute, setNewAttribute] = useState('');
    const [newExtraCostType, setNewExtraCostType] = useState('');
    const [newPackType, setNewPackType] = useState('');
    const [newServiceCostType, setNewServiceCostType] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [togglingAttr, setTogglingAttr] = useState<number | null>(null);

    const { data: resetData, setData: setResetData, post: postReset, processing: resetProcessing, errors: resetErrors, reset: resetResetForm } = useForm({
        password: '',
        confirmation: '',
    });

    const { data, setData, put, processing } = useForm({
        company_name: 'DPS-ERP',
        company_email: 'info@dps-erp.com',
        company_phone: '',
        company_address: '',
        timezone: 'UTC',
        date_format: 'Y-m-d',
        currency: savedCurrency || 'GHS',
        fiscal_year_start: '01-01',
        company_logo: null as File | null,
        remove_logo: false,
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(companyLogo || null);

    const handleLogoChange = (file: File | null) => {
        setData((prev) => ({ ...prev, company_logo: file, remove_logo: false }));
        setLogoPreview(file ? URL.createObjectURL(file) : companyLogo || null);
    };

    const handleLogoRemove = () => {
        setData((prev) => ({ ...prev, company_logo: null, remove_logo: true }));
        setLogoPreview(null);
    };

    const handleSaveSettings = () => {
        put('/admin/settings');
    };

    const handleAddUom = (e: React.FormEvent) => {
        e.preventDefault();
        if (newUom.trim()) {
            router.post('/admin/settings/uom', { value: newUom }, {
                onSuccess: () => setNewUom(''),
            });
        }
    };

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategory.trim()) {
            router.post('/admin/settings/category', { value: newCategory }, {
                onSuccess: () => setNewCategory(''),
            });
        }
    };

    const handleToggleAttribute = (categoryId: number, attrId: number) => {
        setTogglingAttr(attrId);
        router.post('/admin/settings/category-attribute', {
            category_id: categoryId,
            setting_id: attrId,
        }, {
            onSuccess: () => {
                setSelectedCategory((prev: any) => {
                    const exists = prev.attributes?.some((a: any) => a.id === attrId);
                    const updatedAttrs = exists
                        ? prev.attributes.filter((a: any) => a.id !== attrId)
                        : [...(prev.attributes || []), { id: attrId }];
                    return { ...prev, attributes: updatedAttrs };
                });
                setTogglingAttr(null);
            },
            onFinish: () => setTogglingAttr(null),
        });
    };

    const handleAddAttribute = (e: React.FormEvent) => {
        e.preventDefault();
        if (newAttribute.trim()) {
            router.post('/admin/settings/attribute', { value: newAttribute }, {
                onSuccess: () => setNewAttribute(''),
            });
        }
    };

    const handleAddExtraCostType = (e: React.FormEvent) => {
        e.preventDefault();
        if (newExtraCostType.trim()) {
            router.post('/admin/settings/extra-cost-type', { value: newExtraCostType }, {
                onSuccess: () => setNewExtraCostType(''),
            });
        }
    };

    const handleAddPackType = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPackType.trim()) {
            router.post('/admin/settings/pack-type', { value: newPackType }, {
                onSuccess: () => setNewPackType(''),
            });
        }
    };

    const handleAddServiceCostType = (e: React.FormEvent) => {
        e.preventDefault();
        if (newServiceCostType.trim()) {
            router.post('/admin/settings/service-cost-type', { value: newServiceCostType }, {
                onSuccess: () => setNewServiceCostType(''),
            });
        }
    };

    const handleFactoryReset = (e: React.FormEvent) => {
        e.preventDefault();
        Swal.fire({
            title: 'Absolutely sure?',
            html: 'This will <b>permanently wipe all business data</b> — clients, orders, products, services, inventory, production, HRM, finance, everything except your login and system roles/permissions.<br/><br/>A backup is saved on the server first, but restoring it requires manual server access.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, wipe everything',
        }).then((result) => {
            if (result.isConfirmed) {
                postReset('/admin/settings/factory-reset', {
                    onSuccess: () => resetResetForm(),
                });
            }
        });
    };

    // HRM: Departments / Employment Types / Staff Levels
    const deptForm = useForm({ name: '' });
    const empTypeForm = useForm({ name: '' });
    const staffLevelForm = useForm({ name: '' });

    const handleHrmDelete = (url: string, name: string) => {
        Swal.fire({
            title: `Delete ${name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Delete',
        }).then((res) => {
            if (res.isConfirmed) router.delete(url);
        });
    };

    return (
        <AppLayout>
            <Head title="Settings" />

            <div className="mb-6">
                <Link href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Admin
                </Link>
            </div>

            <PageHeader
                title="Settings"
                subtitle="System configuration"
            />

            <div className="flex flex-col md:flex-row gap-6">
                {/* Vertical tab nav -- never needs horizontal scroll, wraps naturally on mobile as a stacked list instead */}
                <nav className="md:w-56 flex-shrink-0 flex flex-col gap-1">
                    {access.admin && (
                        <>
                            <TabNavGroup label="Admin" />
                            <TabNavButton active={activeTab === 'general'} onClick={() => setActiveTab('general')}>General</TabNavButton>
                            <TabNavButton active={activeTab === 'uom'} onClick={() => setActiveTab('uom')} icon={Package}>UOM Options</TabNavButton>
                            <TabNavButton active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} icon={Tag}>Categories</TabNavButton>
                            <TabNavButton active={activeTab === 'attributes'} onClick={() => setActiveTab('attributes')} icon={List}>Attributes</TabNavButton>
                            <TabNavButton active={activeTab === 'extraCosts'} onClick={() => setActiveTab('extraCosts')} icon={Receipt}>Extra Cost Types</TabNavButton>
                            <TabNavButton active={activeTab === 'packTypes'} onClick={() => setActiveTab('packTypes')} icon={Box}>Packing Types</TabNavButton>
                            <TabNavButton active={activeTab === 'serviceCosts'} onClick={() => setActiveTab('serviceCosts')} icon={Wrench}>Service Cost Types</TabNavButton>
                        </>
                    )}
                    {access.hrm && (
                        <>
                            <TabNavGroup label="HRM" />
                            <TabNavButton active={activeTab === 'departments'} onClick={() => setActiveTab('departments')} icon={Building2}>Departments</TabNavButton>
                            <TabNavButton active={activeTab === 'employmentTypes'} onClick={() => setActiveTab('employmentTypes')} icon={Briefcase}>Employment Types</TabNavButton>
                            <TabNavButton active={activeTab === 'staffLevels'} onClick={() => setActiveTab('staffLevels')} icon={Award}>Staff Levels</TabNavButton>
                        </>
                    )}
                    {access.crm && (
                        <>
                            <TabNavGroup label="CRM" />
                            <TabNavButton active={activeTab === 'crmLookups'} onClick={() => setActiveTab('crmLookups')} icon={MapPin}>CRM Lookups</TabNavButton>
                        </>
                    )}
                    {access.factoryReset && (
                        <>
                            <TabNavGroup label="Danger Zone" />
                            <TabNavButton active={activeTab === 'dangerZone'} onClick={() => setActiveTab('dangerZone')} icon={ShieldAlert} danger>Danger Zone</TabNavButton>
                        </>
                    )}
                </nav>

                <div className="flex-1 min-w-0">

            {activeTab === 'general' && access.admin && (
                <div className="max-w-3xl">
                    <GlassCard className="mb-6">
                        <h2 className="text-lg font-semibold mb-4">Company Information</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Company Name</label>
                                <input type="text" value={data.company_name} onChange={(e) => setData('company_name', e.target.value)} className="glass-input w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Email</label>
                                <input type="email" value={data.company_email} onChange={(e) => setData('company_email', e.target.value)} className="glass-input w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Currency</label>
                                <select value={data.currency} onChange={(e) => setData('currency', e.target.value)} className="glass-input w-full">
                                    <option value="USD">USD - US Dollar</option>
                                    <option value="GHS">GHS - Ghana Cedis</option>
                                    <option value="EUR">EUR - Euro</option>
                                </select>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="mb-6">
                        <h2 className="text-lg font-semibold mb-4">Company Logo</h2>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-lg border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-white/5 shrink-0">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Company logo" className="w-full h-full object-contain" />
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
                                <button type="button" onClick={handleLogoRemove} className="text-sm text-slate-400 hover:text-red-500">
                                    Remove
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-slate-400 mt-2">PNG or JPG, up to 2MB. Click "Save Settings" below to apply changes.</p>
                    </GlassCard>

                    <div className="flex gap-3">
                        <button onClick={handleSaveSettings} disabled={processing} className="glass-button flex items-center gap-2">
                            <Save className="w-4 h-4" /> {processing ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'uom' && access.admin && (
                <div className="max-w-3xl">
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5" /> Units of Measure (UOM)
                        </h2>
                        <p className="text-sm text-slate-400 mb-4">Manage inventory UOMs. Mark a UOM "Discrete" (e.g. Pieces) when each unit purchased is a single item with no separate amount-per-pack to measure — the Add Purchase form then locks Qty per Unit to 1 for it instead of treating it as a multiplier.</p>

                        <form onSubmit={handleAddUom} className="flex gap-2 mb-4">
                            <input type="text" value={newUom} onChange={(e) => setNewUom(e.target.value)} placeholder="New UOM" className="glass-input flex-1" />
                            <button type="submit" className="glass-button flex items-center gap-2"><Plus className="w-4 h-4" /> Add</button>
                        </form>

                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-slate-400 uppercase font-medium">Discrete flag</span>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => router.post('/admin/settings/uom/discrete', { discrete: true })}
                                    className="text-xs text-indigo-400 hover:text-indigo-300"
                                >
                                    Select All
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.post('/admin/settings/uom/discrete', { discrete: false })}
                                    className="text-xs text-indigo-400 hover:text-indigo-300"
                                >
                                    Deselect All
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {(uoms || []).map((uom: any) => (
                                <div key={uom.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                                    <div className="min-w-0">
                                        <span className="block truncate">{uom.value}</span>
                                        <label className="flex items-center gap-1.5 mt-1 text-xs text-slate-400 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={!!uom.is_discrete}
                                                onChange={() => router.post(`/admin/settings/uom/${uom.id}/toggle-discrete`)}
                                                className="w-3.5 h-3.5 rounded"
                                            />
                                            Discrete
                                        </label>
                                    </div>
                                    <Link href={`/admin/settings/uom/${uom.id}`} method="delete" as="button" className="text-red-400 hover:text-red-300 shrink-0">
                                        <Trash2 className="w-4 h-4" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            )}

            {activeTab === 'attributes' && access.admin && (
                <div className="max-w-3xl">
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <List className="w-5 h-5" /> Material Attributes
                        </h2>
                        <p className="text-sm text-slate-400 mb-4">Manage material attribute keys (e.g. Length, Weight, Color). Values are set per material.</p>

                        <form onSubmit={handleAddAttribute} className="flex gap-2 mb-6">
                            <input type="text" value={newAttribute} onChange={(e) => setNewAttribute(e.target.value)} placeholder="New Attribute" className="glass-input flex-1" />
                            <button type="submit" className="glass-button flex items-center gap-2"><Plus className="w-4 h-4" /> Add</button>
                        </form>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {(attributes || []).map((attr: any) => (
                                <div key={attr.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                                    <span>{attr.value}</span>
                                    <Link href={`/admin/settings/attribute/${attr.id}`} method="delete" as="button" className="text-red-400 hover:text-red-300">
                                        <Trash2 className="w-4 h-4" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            )}

            {activeTab === 'extraCosts' && access.admin && (
                <div className="max-w-3xl">
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Receipt className="w-5 h-5" /> Extra Cost Types
                        </h2>
                        <p className="text-sm text-slate-400 mb-4">Manage the landed-cost types (e.g. Transport, Sewing) staff can add when recording a stock purchase.</p>

                        <form onSubmit={handleAddExtraCostType} className="flex gap-2 mb-6">
                            <input type="text" value={newExtraCostType} onChange={(e) => setNewExtraCostType(e.target.value)} placeholder="New cost type" className="glass-input flex-1" />
                            <button type="submit" className="glass-button flex items-center gap-2"><Plus className="w-4 h-4" /> Add</button>
                        </form>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {(extraCostTypes || []).map((type: any) => (
                                <div key={type.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                                    <span>{type.value}</span>
                                    <Link href={`/admin/settings/extra-cost-type/${type.id}`} method="delete" as="button" className="text-red-400 hover:text-red-300">
                                        <Trash2 className="w-4 h-4" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            )}

            {activeTab === 'packTypes' && access.admin && (
                <div className="max-w-3xl">
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Box className="w-5 h-5" /> Packing Types
                        </h2>
                        <p className="text-sm text-slate-400 mb-4">Manage how purchased materials are packaged (e.g. Roll, Box, Carton). Used on the Add Purchase form.</p>

                        <form onSubmit={handleAddPackType} className="flex gap-2 mb-6">
                            <input type="text" value={newPackType} onChange={(e) => setNewPackType(e.target.value)} placeholder="New packing type" className="glass-input flex-1" />
                            <button type="submit" className="glass-button flex items-center gap-2"><Plus className="w-4 h-4" /> Add</button>
                        </form>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {(packTypes || []).map((type: any) => (
                                <div key={type.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                                    <span>{type.value}</span>
                                    <Link href={`/admin/settings/pack-type/${type.id}`} method="delete" as="button" className="text-red-400 hover:text-red-300">
                                        <Trash2 className="w-4 h-4" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            )}

            {activeTab === 'serviceCosts' && access.admin && (
                <div className="max-w-3xl">
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Wrench className="w-5 h-5" /> Service Cost Types
                        </h2>
                        <p className="text-sm text-slate-400 mb-4">Manage the cost components (e.g. Workmanship, Profit) staff can add when building a service's Cost of Service breakdown.</p>

                        <form onSubmit={handleAddServiceCostType} className="flex gap-2 mb-6">
                            <input type="text" value={newServiceCostType} onChange={(e) => setNewServiceCostType(e.target.value)} placeholder="New cost type" className="glass-input flex-1" />
                            <button type="submit" className="glass-button flex items-center gap-2"><Plus className="w-4 h-4" /> Add</button>
                        </form>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {(serviceCostTypes || []).map((type: any) => (
                                <div key={type.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                                    <span>{type.value}</span>
                                    <Link href={`/admin/settings/service-cost-type/${type.id}`} method="delete" as="button" className="text-red-400 hover:text-red-300">
                                        <Trash2 className="w-4 h-4" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            )}

            {activeTab === 'categories' && access.admin && (
                <div className="max-w-3xl">
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Tag className="w-5 h-5" /> Product Categories
                        </h2>
                        <p className="text-sm text-slate-400 mb-4">Manage product categories and their linked attributes.</p>

                        <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
                            <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New Category" className="glass-input flex-1" />
                            <button type="submit" className="glass-button flex items-center gap-2"><Plus className="w-4 h-4" /> Add</button>
                        </form>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {(categories || []).map((cat: any) => (
                                <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="truncate">{cat.name}</span>
                                        {cat.attributes?.length > 0 && (
                                            <span className="text-xs text-indigo-400 shrink-0">({cat.attributes.length})</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button onClick={() => setSelectedCategory(cat)} className="text-indigo-400 hover:text-indigo-300 p-1">
                                            <List className="w-4 h-4" />
                                        </button>
                                        <Link href={`/admin/settings/category/${cat.id}`} method="delete" as="button" className="text-red-400 hover:text-red-300 p-1">
                                            <Trash2 className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            )}

            {activeTab === 'departments' && access.hrm && (
                <div className="max-w-3xl">
                    <GlassCard>
                        <div className="flex justify-between items-center mb-2"><h2 className="text-lg font-semibold">Departments</h2><span className="text-sm text-gray-500">{(departments || []).length} items</span></div>
                        <form onSubmit={(e) => { e.preventDefault(); deptForm.post('/hrm/settings/departments', { onSuccess: () => deptForm.reset() }); }}>
                            <div className="flex gap-2 mb-4">
                                <input className="glass-input flex-1" placeholder="New Dept" value={deptForm.data.name} onChange={e => deptForm.setData('name', e.target.value)} />
                                <button className="glass-button"><Plus className="w-4 h-4" /></button>
                            </div>
                        </form>
                        <DataTable columns={[
                            { header: 'Name', key: 'name' },
                            { header: 'Actions', className: 'text-right', render: (d: any) => (
                                <div className="flex items-center justify-end gap-3">
                                    <Link href={`/hrm/settings/departments/${d.id}/edit`}><Pencil className="w-4 h-4 text-slate-400 hover:text-slate-700" /></Link>
                                    <button onClick={() => handleHrmDelete(`/hrm/settings/departments/${d.id}`, d.name)}><Trash2 className="w-4 h-4 text-red-500" /></button>
                                </div>
                            ) }
                        ]} data={departments || []} />
                    </GlassCard>
                </div>
            )}

            {activeTab === 'employmentTypes' && access.hrm && (
                <div className="max-w-3xl">
                    <GlassCard>
                        <div className="flex justify-between items-center mb-2"><h2 className="text-lg font-semibold">Employment Types</h2><span className="text-sm text-gray-500">{(employmentTypes || []).length} items</span></div>
                        <form onSubmit={(e) => { e.preventDefault(); empTypeForm.post('/hrm/settings/employment-types', { onSuccess: () => empTypeForm.reset() }); }}>
                            <div className="flex gap-2 mb-4">
                                <input className="glass-input flex-1" placeholder="New Type" value={empTypeForm.data.name} onChange={e => empTypeForm.setData('name', e.target.value)} />
                                <button className="glass-button"><Plus className="w-4 h-4" /></button>
                            </div>
                        </form>
                        <DataTable columns={[
                            { header: 'Name', key: 'name' },
                            { header: 'Actions', className: 'text-right', render: (e: any) => (
                                <div className="flex items-center justify-end gap-3">
                                    <Link href={`/hrm/settings/employment-types/${e.id}/edit`}><Pencil className="w-4 h-4 text-slate-400 hover:text-slate-700" /></Link>
                                    <button onClick={() => handleHrmDelete(`/hrm/settings/employment-types/${e.id}`, e.name)}><Trash2 className="w-4 h-4 text-red-500" /></button>
                                </div>
                            ) }
                        ]} data={employmentTypes || []} />
                    </GlassCard>
                </div>
            )}

            {activeTab === 'staffLevels' && access.hrm && (
                <div className="max-w-3xl space-y-6">
                    <GlassCard>
                        <div className="flex justify-between items-center mb-2"><h2 className="text-lg font-semibold">Staff Levels</h2><span className="text-sm text-gray-500">{(staffLevels || []).length} items</span></div>
                        <form onSubmit={(e) => { e.preventDefault(); staffLevelForm.post('/hrm/settings/staff-levels', { onSuccess: () => staffLevelForm.reset() }); }}>
                            <div className="flex gap-2 mb-4">
                                <select className="glass-input flex-1" value={staffLevelForm.data.name} onChange={e => staffLevelForm.setData('name', e.target.value)}>
                                    <option value="">Select Staff Level</option>
                                    <option value="Managing Director">Managing Director</option>
                                    <option value="General Manager">General Manager</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Supervisor">Supervisor</option>
                                    <option value="Assistant Supervisor">Assistant Supervisor</option>
                                    <option value="Senior Worker">Senior Worker</option>
                                    <option value="Junior Worker">Junior Worker</option>
                                    <option value="Intern">Intern</option>
                                </select>
                                <button className="glass-button" disabled={!staffLevelForm.data.name}><Plus className="w-4 h-4" /></button>
                            </div>
                        </form>
                        <DataTable columns={[
                            { header: 'Name', key: 'name' },
                            { header: 'Manager?', render: (s: any) => s.is_manager ? <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600">Yes</span> : <span className="text-xs text-gray-400">—</span> },
                            { header: 'Actions', className: 'text-right', render: (s: any) => (
                                <div className="flex items-center justify-end gap-3">
                                    <Link href={`/hrm/settings/staff-levels/${s.id}/edit`}><Pencil className="w-4 h-4 text-slate-400 hover:text-slate-700" /></Link>
                                    <button onClick={() => handleHrmDelete(`/hrm/settings/staff-levels/${s.id}`, s.name)}><Trash2 className="w-4 h-4 text-red-500" /></button>
                                </div>
                            ) }
                        ]} data={staffLevels || []} />
                    </GlassCard>

                    <GlassCard>
                        <div className="flex justify-between items-center mb-2"><h2 className="text-lg font-semibold">Leave Types</h2><span className="text-sm text-gray-500">{(leaveTypes || []).length} items</span></div>
                        <p className="text-xs text-gray-500 mb-3">Set days per year for each leave type, per staff level — fill in a whole row (e.g. Manager) at once, then Save.</p>
                        <LeaveTypeMatrix leaveTypes={leaveTypes || []} leaveTypeNames={leaveTypeNames || []} staffLevels={staffLevels || []} />
                    </GlassCard>
                </div>
            )}

            {activeTab === 'crmLookups' && access.crm && (
                <div className="grid md:grid-cols-2 gap-6">
                    <LookupListEditor type="sources" title="Sources" items={sources || []} />
                    <LookupListEditor type="industries" title="Industries" items={industries || []} />
                    <LookupListEditor type="regions" title="Regions" items={regions || []} />
                    <LookupListEditor type="cities" title="Cities" items={cities || []} />
                    <div className="md:col-span-2">
                        <LookupListEditor type="neighbourhoods" title="Neighbourhoods" items={neighbourhoods || []} />
                    </div>
                </div>
            )}

            {activeTab === 'dangerZone' && access.factoryReset && (
                <div className="max-w-3xl">
                    <GlassCard className="border border-red-500/30">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-400">
                            <AlertTriangle className="w-5 h-5" /> Factory Reset
                        </h2>
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-sm text-red-300 space-y-1">
                            <p className="font-medium">This permanently wipes all business data:</p>
                            <p>Clients, orders, products, services, inventory, production, HRM, finance, marketing, studio, chat — everything except your login and the system's roles/permissions.</p>
                            <p>A timestamped backup of the full database is saved on the server before anything is deleted, but restoring it requires manual server access — this is not a self-service undo.</p>
                        </div>

                        <form onSubmit={handleFactoryReset} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Confirm your password</label>
                                <input
                                    type="password"
                                    value={resetData.password}
                                    onChange={(e) => setResetData('password', e.target.value)}
                                    className="glass-input w-full"
                                    autoComplete="current-password"
                                    required
                                />
                                {resetErrors.password && <p className="text-red-400 text-sm mt-1">{resetErrors.password}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Type <span className="font-mono font-bold">RESET</span> to confirm</label>
                                <input
                                    type="text"
                                    value={resetData.confirmation}
                                    onChange={(e) => setResetData('confirmation', e.target.value)}
                                    className="glass-input w-full font-mono"
                                    placeholder="RESET"
                                    required
                                />
                                {resetErrors.confirmation && <p className="text-red-400 text-sm mt-1">{resetErrors.confirmation}</p>}
                            </div>
                            <button
                                type="submit"
                                disabled={resetProcessing || resetData.confirmation !== 'RESET' || !resetData.password}
                                className="glass-button bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <AlertTriangle className="w-4 h-4" /> {resetProcessing ? 'Wiping...' : 'Factory Reset'}
                            </button>
                        </form>
                    </GlassCard>
                </div>
            )}

                </div>
            </div>

            {selectedCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">{selectedCategory.name} — Attributes</h2>
                            <button onClick={() => setSelectedCategory(null)} className="p-1 hover:bg-slate-100 rounded">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">Toggle which attributes apply to this category.</p>
                        <div className="space-y-2">
                            {(attributes || []).map((attr: any) => {
                                const isLinked = selectedCategory.attributes?.some((a: any) => a.id === attr.id);
                                return (
                                    <div key={attr.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <span>{attr.value}</span>
                                        <button
                                            onClick={() => handleToggleAttribute(selectedCategory.id, attr.id)}
                                            disabled={togglingAttr === attr.id}
                                            className={`p-1.5 rounded-full transition-colors ${isLinked ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'} ${togglingAttr === attr.id ? 'opacity-50 cursor-wait' : ''}`}
                                        >
                                            {isLinked ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                        </button>
                                    </div>
                                );
                            })}
                            {(!attributes || attributes.length === 0) && (
                                <p className="text-sm text-slate-400 text-center py-4">No attributes created yet. Add some in the Attributes tab.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
