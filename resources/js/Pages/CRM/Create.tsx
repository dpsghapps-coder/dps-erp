import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, SearchableSelect, PhoneInput } from '@/Components/ui';
import GPSMapPicker from '@/Components/GPSMapPicker';
import { COUNTRIES } from '@/Utils/countries';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, MapPin, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';

interface ContactFormItem {
    first_name: string;
    last_name: string;
    job_title: string;
    phone: string;
    branch: string;
    region: string;
    city: string;
    neighbourhood: string;
}

const emptyContact: ContactFormItem = {
    first_name: '', last_name: '', job_title: '', phone: '', branch: '', region: '', city: '', neighbourhood: '',
};

export default function ClientCreate() {
    const { url } = usePage();
    const { sources = [], industries = [], regions = [], cities = [], neighbourhoods = [] } = usePage().props as any;
    const fromLeads = url.includes('from=leads');
    const { data, setData, post, processing, errors } = useForm({
        company_name: '',
        email: '',
        phone: '',
        industry: '',
        website: '',
        address: '',
        city: 'Accra',
        country: 'Ghana',
        region: 'Greater Accra',
        neighbourhood: '',
        location: '',
        source: '',
        estimated_value: '',
        create_lead: false,
        notes: '',
        linkedin: '',
        facebook: '',
        instagram: '',
        twitter: '',
        tiktok: '',
        contacts: [] as ContactFormItem[],
    });
    const [showMapModal, setShowMapModal] = useState(false);

    const addContact = () => setData('contacts', [...data.contacts, { ...emptyContact }]);
    const removeContact = (index: number) => setData('contacts', data.contacts.filter((_, i) => i !== index));
    const setContactField = (index: number, field: keyof ContactFormItem, value: string) => {
        const next = [...data.contacts];
        next[index] = { ...next[index], [field]: value };
        setData('contacts', next);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/crm');
    };

    return (
        <AppLayout>
            <Head title="Add Client" />

            <div className="mb-6">
                <Link href={fromLeads ? '/crm/leads' : '/crm'} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> {fromLeads ? 'Back to Sales Management' : 'Back to Clients'}
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
                                <label className="block text-sm font-medium mb-2">Company/Client Name *</label>
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
                                <SearchableSelect
                                    value={data.industry}
                                    onChange={(value) => setData('industry', value)}
                                    options={industries}
                                    placeholder="Select industry"
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
                                    <SearchableSelect
                                        value={data.source}
                                        onChange={(value) => setData('source', value)}
                                        options={sources}
                                        placeholder="Select source"
                                    />
                                </div>
                                {data.create_lead && (
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
                                )}
                            </div>

                            <label className="flex items-start gap-2.5 pt-2 border-t border-slate-200 dark:border-white/10">
                                <input
                                    type="checkbox"
                                    checked={data.create_lead}
                                    onChange={(e) => setData('create_lead', e.target.checked)}
                                    className="mt-0.5 rounded border-slate-300 dark:border-white/20 text-indigo-500 focus:ring-indigo-500/50"
                                />
                                <span className="text-sm">
                                    <span className="font-medium block">Start this client in the sales pipeline</span>
                                    <span className="text-xs text-slate-400">
                                        Creates a New Lead deal. Uncheck this if you're just cataloging an existing customer.
                                    </span>
                                </span>
                            </label>
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
                                <PhoneInput
                                    value={data.phone}
                                    onChange={(value) => setData('phone', value)}
                                    error={errors.phone}
                                />
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
                                    <label className="block text-sm font-medium mb-2">Region</label>
                                    <SearchableSelect
                                        value={data.region}
                                        onChange={(value) => setData('region', value)}
                                        options={regions}
                                        placeholder="Select region"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">City</label>
                                    <SearchableSelect
                                        value={data.city}
                                        onChange={(value) => setData('city', value)}
                                        options={cities}
                                        placeholder="Select city"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Neighbourhood</label>
                                    <SearchableSelect
                                        value={data.neighbourhood}
                                        onChange={(value) => setData('neighbourhood', value)}
                                        options={neighbourhoods}
                                        placeholder="Select neighbourhood"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Country</label>
                                    <SearchableSelect
                                        value={data.country}
                                        onChange={(value) => setData('country', value)}
                                        options={COUNTRIES}
                                        placeholder="Select country"
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

                    {/* Contacts */}
                    <GlassCard className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Contacts</h2>
                            <button
                                type="button"
                                onClick={addContact}
                                className="glass-button-secondary flex items-center gap-2 text-sm"
                            >
                                <Plus className="w-4 h-4" /> Add Contact
                            </button>
                        </div>
                        {data.contacts.length === 0 ? (
                            <p className="text-sm text-slate-400">
                                No contacts added yet. You can add people at this company now, or later from the client page.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {data.contacts.map((contact, index) => (
                                    <div key={index} className="relative border border-slate-200 dark:border-white/10 rounded-xl p-4">
                                        <button
                                            type="button"
                                            onClick={() => removeContact(index)}
                                            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors"
                                            aria-label="Remove contact"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pr-8">
                                            <div>
                                                <label className="block text-xs font-medium mb-1">First Name *</label>
                                                <input
                                                    type="text"
                                                    value={contact.first_name}
                                                    onChange={(e) => setContactField(index, 'first_name', e.target.value)}
                                                    className="glass-input w-full"
                                                />
                                                {(errors as any)[`contacts.${index}.first_name`] && (
                                                    <p className="text-red-500 text-xs mt-1">{(errors as any)[`contacts.${index}.first_name`]}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1">Last Name</label>
                                                <input
                                                    type="text"
                                                    value={contact.last_name}
                                                    onChange={(e) => setContactField(index, 'last_name', e.target.value)}
                                                    className="glass-input w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1">Job Title</label>
                                                <input
                                                    type="text"
                                                    value={contact.job_title}
                                                    onChange={(e) => setContactField(index, 'job_title', e.target.value)}
                                                    className="glass-input w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1">Phone</label>
                                                <PhoneInput
                                                    value={contact.phone}
                                                    onChange={(value) => setContactField(index, 'phone', value)}
                                                    error={(errors as any)[`contacts.${index}.phone`]}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1">Branch</label>
                                                <input
                                                    type="text"
                                                    value={contact.branch}
                                                    onChange={(e) => setContactField(index, 'branch', e.target.value)}
                                                    className="glass-input w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1">Region</label>
                                                <SearchableSelect
                                                    value={contact.region}
                                                    onChange={(value) => setContactField(index, 'region', value)}
                                                    options={regions}
                                                    placeholder="Select region"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1">City</label>
                                                <SearchableSelect
                                                    value={contact.city}
                                                    onChange={(value) => setContactField(index, 'city', value)}
                                                    options={cities}
                                                    placeholder="Select city"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1">Neighbourhood</label>
                                                <SearchableSelect
                                                    value={contact.neighbourhood}
                                                    onChange={(value) => setContactField(index, 'neighbourhood', value)}
                                                    options={neighbourhoods}
                                                    placeholder="Select neighbourhood"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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