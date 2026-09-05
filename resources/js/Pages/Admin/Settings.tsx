import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, Plus, Trash2, Package, Tag, List, X, Check, Receipt, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';

export default function Settings() {
    const page = usePage().props as any;
    const { uoms, categories, attributes, extraCostTypes, currency: savedCurrency } = page;
    const isAdmin = page.auth?.user?.role?.name === 'admin';
    const permissions = (page.auth?.permissions as string[]) || [];
    const canFactoryReset = isAdmin || permissions.includes('*') || permissions.includes('admin.factory_reset');
    const [activeTab, setActiveTab] = useState<'general' | 'uom' | 'categories' | 'attributes' | 'extraCosts' | 'dangerZone'>('general');
    const [newUom, setNewUom] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [newAttribute, setNewAttribute] = useState('');
    const [newExtraCostType, setNewExtraCostType] = useState('');
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
    });

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

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-700 pb-2">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'general' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    General
                </button>
                <button
                    onClick={() => setActiveTab('uom')}
                    className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'uom' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <Package className="w-4 h-4 inline mr-2" />UOM Options
                </button>
                <button
                    onClick={() => setActiveTab('categories')}
                    className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'categories' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <Tag className="w-4 h-4 inline mr-2" />Categories
                </button>
                <button
                    onClick={() => setActiveTab('attributes')}
                    className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'attributes' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <List className="w-4 h-4 inline mr-2" />Attributes
                </button>
                <button
                    onClick={() => setActiveTab('extraCosts')}
                    className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'extraCosts' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <Receipt className="w-4 h-4 inline mr-2" />Extra Cost Types
                </button>
                {canFactoryReset && (
                    <button
                        onClick={() => setActiveTab('dangerZone')}
                        className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'dangerZone' ? 'bg-red-600 text-white' : 'text-red-400 hover:text-red-300'}`}
                    >
                        <ShieldAlert className="w-4 h-4 inline mr-2" />Danger Zone
                    </button>
                )}
            </div>

            {activeTab === 'general' && (
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

                    <div className="flex gap-3">
                        <button onClick={handleSaveSettings} disabled={processing} className="glass-button flex items-center gap-2">
                            <Save className="w-4 h-4" /> {processing ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'uom' && (
                <div className="max-w-3xl">
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5" /> Units of Measure (UOM)
                        </h2>
                        <p className="text-sm text-slate-400 mb-4">Manage inventory UOMs.</p>
                        
                        <form onSubmit={handleAddUom} className="flex gap-2 mb-6">
                            <input type="text" value={newUom} onChange={(e) => setNewUom(e.target.value)} placeholder="New UOM" className="glass-input flex-1" />
                            <button type="submit" className="glass-button flex items-center gap-2"><Plus className="w-4 h-4" /> Add</button>
                        </form>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {(uoms || []).map((uom: any) => (
                                <div key={uom.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                                    <span>{uom.value}</span>
                                    <Link href={`/admin/settings/uom/${uom.id}`} method="delete" as="button" className="text-red-400 hover:text-red-300">
                                        <Trash2 className="w-4 h-4" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            )}

            {activeTab === 'attributes' && (
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

            {activeTab === 'extraCosts' && (
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

            {activeTab === 'categories' && (
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

            {activeTab === 'dangerZone' && canFactoryReset && (
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