import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, Plus, Trash2, Package, Tag, List, X, Check, Building2 } from 'lucide-react';
import { useState } from 'react';

export default function Settings() {
    const { uoms, categories, attributes, departments } = usePage().props as any;
    const [activeTab, setActiveTab] = useState<'general' | 'uom' | 'categories' | 'attributes' | 'departments'>('general');
    const [newUom, setNewUom] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [newAttribute, setNewAttribute] = useState('');
    const [newDeptName, setNewDeptName] = useState('');
    const [newDeptCode, setNewDeptCode] = useState('');
    const [newDeptDesc, setNewDeptDesc] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [togglingAttr, setTogglingAttr] = useState<number | null>(null);

    const { data, setData, post, processing } = useForm({
        company_name: 'DPS-ERP',
        company_email: 'info@dps-erp.com',
        company_phone: '',
        company_address: '',
        timezone: 'UTC',
        date_format: 'Y-m-d',
        currency: 'USD',
        fiscal_year_start: '01-01',
    });

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

    const handleAddDepartment = (e: React.FormEvent) => {
        e.preventDefault();
        if (newDeptName.trim()) {
            router.post('/admin/settings/department', {
                name: newDeptName,
                code: newDeptCode || undefined,
                description: newDeptDesc || undefined,
            }, {
                onSuccess: () => { setNewDeptName(''); setNewDeptCode(''); setNewDeptDesc(''); },
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Settings" />

            <div className="mb-6">
                <Link href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
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
                    onClick={() => setActiveTab('departments')}
                    className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'departments' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <Building2 className="w-4 h-4 inline mr-2" />Departments
                </button>
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
                        <button className="glass-button flex items-center gap-2">
                            <Save className="w-4 h-4" /> Save Settings
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

            {activeTab === 'departments' && (
                <div className="max-w-3xl">
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Building2 className="w-5 h-5" /> Departments
                        </h2>
                        <p className="text-sm text-slate-400 mb-4">Manage departments used across the system (User assignment, Purchase Requests).</p>

                        <form onSubmit={handleAddDepartment} className="space-y-3 mb-6">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newDeptName}
                                    onChange={(e) => setNewDeptName(e.target.value)}
                                    placeholder="Department name *"
                                    className="glass-input flex-1"
                                    required
                                />
                                <input
                                    type="text"
                                    value={newDeptCode}
                                    onChange={(e) => setNewDeptCode(e.target.value)}
                                    placeholder="Code (optional)"
                                    className="glass-input w-32"
                                />
                                <button type="submit" className="glass-button flex items-center gap-2"><Plus className="w-4 h-4" /> Add</button>
                            </div>
                            <input
                                type="text"
                                value={newDeptDesc}
                                onChange={(e) => setNewDeptDesc(e.target.value)}
                                placeholder="Description (optional)"
                                className="glass-input w-full"
                            />
                        </form>

                        <div className="space-y-2">
                            {(departments || []).map((dept: any) => (
                                <div key={dept.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{dept.name}</span>
                                            {dept.code && <span className="text-xs text-slate-400 font-mono">({dept.code})</span>}
                                            {!dept.is_active && <span className="text-xs text-red-400">Inactive</span>}
                                        </div>
                                        {dept.description && <p className="text-xs text-slate-500 mt-0.5">{dept.description}</p>}
                                    </div>
                                    <Link href={`/admin/settings/department/${dept.id}`} method="delete" as="button" className="text-red-400 hover:text-red-300 shrink-0 ml-4">
                                        <Trash2 className="w-4 h-4" />
                                    </Link>
                                </div>
                            ))}
                            {(!departments || departments.length === 0) && (
                                <p className="text-sm text-slate-400 text-center py-4">No departments created yet.</p>
                            )}
                        </div>
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