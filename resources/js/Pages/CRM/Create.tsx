import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import GPSMapPicker from '@/Components/GPSMapPicker';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, MapPin, X } from 'lucide-react';
import { useState } from 'react';

export default function ClientCreate() {
    const { url } = usePage();
    const fromLeads = url.includes('from=leads');
    const { data, setData, post, processing, errors } = useForm({
        company_name: '',
        email: '',
        phone: '',
        industry: '',
        website: '',
        address: '',
        city: '',
        country: '',
        location: '',
        source: '',
        estimated_value: '',
        notes: '',
        linkedin: '',
        facebook: '',
        instagram: '',
        twitter: '',
        tiktok: '',
    });
    const [showMapModal, setShowMapModal] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/crm');
    };

    return (
        <AppLayout>
            <Head title="Add Client" />

            <div className="mb-6">
                <Link href={fromLeads ? '/crm/leads' : '/crm'} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> {fromLeads ? 'Back to Lead Management' : 'Back to Clients'}
                </Link>
            </div>

            <PageHeader title="Add Client" subtitle="Create a new client" />

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
                                    placeholder="Company name"
                                />
                                {errors.company_name && <p className="text-red-500 text-sm mt-1">{errors.company_name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Industry</label>
                                <input
                                    type="text"
                                    value={data.industry}
                                    onChange={(e) => setData('industry', e.target.value)}
                                    className="glass-input w-full"
                                    placeholder="Industry"
                                />
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

                            <div className="grid grid-cols-2 gap-4">
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
                                <div>
                                    <label className="block text-sm font-medium mb-2">Estimated Value</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.estimated_value}
                                        onChange={(e) => setData('estimated_value', e.target.value)}
                                        className="glass-input w-full"
                                        placeholder="e.g. 15000"
                                    />
                                    {errors.estimated_value && <p className="text-red-500 text-sm mt-1">{errors.estimated_value}</p>}
                                </div>
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
                                <label className="block text-sm font-medium mb-2">Phone</label>
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

                    {/* Social Media */}
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4">Social Media</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">LinkedIn</label>
                                <input 
                                    type="url"
                                    value={data.linkedin}
                                    onChange={(e) => setData('linkedin', e.target.value)}
                                    className="glass-input w-full"
                                    placeholder="https://linkedin.com/company/..."
                                />
                                {errors.linkedin && <p className="text-red-500 text-sm mt-1">{errors.linkedin}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Facebook</label>
                                <input 
                                    type="url"
                                    value={data.facebook}
                                    onChange={(e) => setData('facebook', e.target.value)}
                                    className="glass-input w-full"
                                    placeholder="https://facebook.com/..."
                                />
                                {errors.facebook && <p className="text-red-500 text-sm mt-1">{errors.facebook}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Instagram</label>
                                <input 
                                    type="url"
                                    value={data.instagram}
                                    onChange={(e) => setData('instagram', e.target.value)}
                                    className="glass-input w-full"
                                    placeholder="https://instagram.com/..."
                                />
                                {errors.instagram && <p className="text-red-500 text-sm mt-1">{errors.instagram}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Twitter / X</label>
                                <input 
                                    type="url"
                                    value={data.twitter}
                                    onChange={(e) => setData('twitter', e.target.value)}
                                    className="glass-input w-full"
                                    placeholder="https://x.com/..."
                                />
                                {errors.twitter && <p className="text-red-500 text-sm mt-1">{errors.twitter}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">TikTok</label>
                                <input 
                                    type="url"
                                    value={data.tiktok}
                                    onChange={(e) => setData('tiktok', e.target.value)}
                                    className="glass-input w-full"
                                    placeholder="https://tiktok.com/@..."
                                />
                                {errors.tiktok && <p className="text-red-500 text-sm mt-1">{errors.tiktok}</p>}
                            </div>
                        </div>
                    </GlassCard>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                    <Link href="/crm" className="glass-button-secondary">Cancel</Link>
                    <button type="submit" disabled={processing} className="glass-button">
                        {processing ? 'Saving...' : 'Save Client'}
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