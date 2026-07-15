import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import GPSMapPicker from '@/Components/GPSMapPicker';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, MapPin, X } from 'lucide-react';
import { useState } from 'react';

export default function ClientEdit() {
    const { client } = usePage().props as any;
    const { data, setData, put, processing, errors } = useForm({
        company_name: client?.company_name || '',
        email: client?.email || '',
        phone: client?.phone || '',
        status: client?.status || 'lead',
        industry: client?.industry || '',
        website: client?.website || '',
        address: client?.address || '',
        city: client?.city || '',
        country: client?.country || '',
        location: client?.location || '',
        source: client?.source || '',
        contact_person_1: client?.contact_person_1 || '',
        contact_person_mobile: client?.contact_person_mobile || '',
        notes: client?.notes || '',
    });
    const [showMapModal, setShowMapModal] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/crm/${client?.id}`);
    };

    return (
        <AppLayout>
            <Head title="Edit Client" />

            <div className="mb-6">
                <Link href={`/crm/${client?.id}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Client
                </Link>
            </div>

            <PageHeader title="Edit Client" subtitle="Update client information" />

            <form onSubmit={handleSubmit}>
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Company Name *</label>
                                <input 
                                    type="text"
                                    value={data.company_name}
                                    onChange={(e) => setData('company_name', e.target.value)}
                                    className="glass-input w-full"
                                />
                                {errors.company_name && <p className="text-red-500 text-sm mt-1">{errors.company_name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Status *</label>
                                    <select 
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="glass-input w-full"
                                    >
                                        <option value="lead">Lead</option>
                                        <option value="prospect">Prospect</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Industry</label>
                                    <input 
                                        type="text"
                                        value={data.industry}
                                        onChange={(e) => setData('industry', e.target.value)}
                                        className="glass-input w-full"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Website</label>
                                <input 
                                    type="url"
                                    value={data.website}
                                    onChange={(e) => setData('website', e.target.value)}
                                    className="glass-input w-full"
                                    placeholder="https://..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Source</label>
                                <input 
                                    type="text"
                                    value={data.source}
                                    onChange={(e) => setData('source', e.target.value)}
                                    className="glass-input w-full"
                                    placeholder="Referral, Ads, etc."
                                />
                            </div>
                        </div>
                    </GlassCard>

                    {/* Contact Info */}
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Email</label>
                                <input 
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="glass-input w-full"
                                    placeholder="email@company.com"
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Company Contact No</label>
                                <input 
                                    type="text"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="glass-input w-full"
                                    placeholder="0XXXXXXXXX (10 digits starting with 0)"
                                    maxLength={10}
                                />
                                <p className="text-xs text-slate-400 mt-1">10 digits starting with 0</p>
                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Address</label>
                                <textarea 
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    className="glass-input w-full h-20"
                                    placeholder="Street address"
                                />
                            </div>

                        <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">City</label>
                                    <input 
                                        type="text"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        className="glass-input w-full"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-2">Country</label>
                                    <input 
                                        type="text"
                                        value={data.country}
                                        onChange={(e) => setData('country', e.target.value)}
                                        className="glass-input w-full"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">GPS Location</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={data.location}
                                        onChange={(e) => setData('location', e.target.value)}
                                        placeholder="lat,lng"
                                        className="glass-input flex-1"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowMapModal(true)}
                                        className="glass-button-secondary px-3"
                                    >
                                        <MapPin className="w-4 h-4" />
                                    </button>
                                </div>
                                {data.location && (
                                    <a
                                        href={`https://www.google.com/maps?q=${data.location}`}
                                        target="_blank"
                                        className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                                    >
                                        View on Google Maps
                                    </a>
                                )}
                            </div>
                        </div>
                    </GlassCard>

                    {/* Contact Person */}
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4">Contact Person</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Contact Person 1</label>
                                <input 
                                    type="text"
                                    value={data.contact_person_1}
                                    onChange={(e) => setData('contact_person_1', e.target.value)}
                                    className="glass-input w-full"
                                    placeholder="Full name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Contact Person Mobile</label>
                                <input 
                                    type="text"
                                    value={data.contact_person_mobile}
                                    onChange={(e) => setData('contact_person_mobile', e.target.value)}
                                    className="glass-input w-full"
                                    placeholder="0XXXXXXXXX (10 digits starting with 0)"
                                    maxLength={10}
                                />
                                <p className="text-xs text-slate-400 mt-1">10 digits starting with 0</p>
                                {errors.contact_person_mobile && <p className="text-red-500 text-sm mt-1">{errors.contact_person_mobile}</p>}
                            </div>
                        </div>
                    </GlassCard>

                    {/* Notes */}
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4">Notes</h2>
                        <div>
                            <textarea 
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                className="glass-input w-full h-40"
                                placeholder="Additional notes..."
                            />
                        </div>
                    </GlassCard>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                    <Link href={`/crm/${client?.id}`} className="glass-button-secondary">Cancel</Link>
                    <button type="submit" disabled={processing} className="glass-button">
                        {processing ? 'Updating...' : 'Update Client'}
                    </button>
                </div>
            </form>

            {showMapModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Pick Location</h3>
                            <button onClick={() => setShowMapModal(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <GPSMapPicker
                            initialLocation={data.location}
                            onSave={(coords) => {
                                setData('location', coords);
                                setShowMapModal(false);
                            }}
                            onClose={() => setShowMapModal(false)}
                        />
                    </div>
                </div>
            )}
        </AppLayout>
    );
}