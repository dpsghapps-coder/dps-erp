import { Head, useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { CheckCircle2, Clock, Upload, ImageOff, Ban, Loader2 } from 'lucide-react';

type Status = 'pending' | 'submitted' | 'approved' | 'expired' | 'not_found';

const STATUS_CONTENT: Record<Exclude<Status, 'pending'>, { icon: any; title: string; body: string }> = {
    submitted: {
        icon: CheckCircle2,
        title: 'Thanks — you\'re all set',
        body: 'Your details have been submitted and are now waiting for HR to review. You\'ll hear from them shortly.',
    },
    approved: {
        icon: CheckCircle2,
        title: 'Welcome aboard!',
        body: 'Your details have already been reviewed and your employee record has been created. Please contact HR if you need login access.',
    },
    expired: {
        icon: Clock,
        title: 'This link has expired',
        body: 'This invite link is no longer valid. Please contact HR to request a new one.',
    },
    not_found: {
        icon: Ban,
        title: 'Link not found',
        body: 'This invite link doesn\'t exist. Double check the link, or contact HR to request a new one.',
    },
};

export default function OnboardingShow() {
    const { status, companyName, companyLogo } = usePage().props as any;
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        mobile_1: '',
        mobile_2: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relation: '',
        avatar: null as File | null,
    });

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('avatar', file);
            const reader = new FileReader();
            reader.onloadend = () => setLogoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(window.location.pathname, { forceFormData: true });
    };

    const nonPendingContent = status !== 'pending' ? STATUS_CONTENT[status as Exclude<Status, 'pending'>] : null;

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Head title="Join Us" />
            <div className="w-full max-w-xl">
                <div className="text-center mb-6">
                    {companyLogo && (
                        <img src={companyLogo} alt={companyName} className="h-14 mx-auto mb-3 object-contain" />
                    )}
                    <h1 className="text-2xl font-bold text-slate-900">{companyName}</h1>
                    <p className="text-slate-500 mt-1">Employee Onboarding</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                    {nonPendingContent ? (
                        <div className="text-center py-6">
                            <nonPendingContent.icon className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
                            <h2 className="text-lg font-semibold mb-2">{nonPendingContent.title}</h2>
                            <p className="text-sm text-slate-500">{nonPendingContent.body}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold mb-1">Tell us about yourself</h2>
                                <p className="text-sm text-slate-500">
                                    Fill in your details below. HR will review this and follow up with the rest of your setup.
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300 hover:border-indigo-400 transition-colors shrink-0"
                                >
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Photo preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageOff className="w-5 h-5 text-slate-300" />
                                    )}
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                                <label className="glass-button-secondary flex items-center gap-2 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <Upload className="w-4 h-4" /> {logoPreview ? 'Change photo' : 'Upload photo (optional)'}
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">First Name *</label>
                                    <input type="text" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} className="glass-input w-full" />
                                    {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Last Name *</label>
                                    <input type="text" value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} className="glass-input w-full" />
                                    {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Email *</label>
                                <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="glass-input w-full" />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Mobile Number *</label>
                                    <input type="text" value={data.mobile_1} onChange={(e) => setData('mobile_1', e.target.value)} className="glass-input w-full" />
                                    {errors.mobile_1 && <p className="text-red-500 text-sm mt-1">{errors.mobile_1}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Alternate Mobile</label>
                                    <input type="text" value={data.mobile_2} onChange={(e) => setData('mobile_2', e.target.value)} className="glass-input w-full" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Emergency Contact Name</label>
                                    <input
                                        type="text"
                                        value={data.emergency_contact_name}
                                        onChange={(e) => setData('emergency_contact_name', e.target.value)}
                                        className="glass-input w-full"
                                    />
                                    {errors.emergency_contact_name && <p className="text-red-500 text-sm mt-1">{errors.emergency_contact_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Emergency Contact Phone</label>
                                    <input
                                        type="text"
                                        value={data.emergency_contact_phone}
                                        onChange={(e) => setData('emergency_contact_phone', e.target.value)}
                                        className="glass-input w-full"
                                    />
                                    {errors.emergency_contact_phone && <p className="text-red-500 text-sm mt-1">{errors.emergency_contact_phone}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Relationship to You</label>
                                <input
                                    type="text"
                                    value={data.emergency_contact_relation}
                                    onChange={(e) => setData('emergency_contact_relation', e.target.value)}
                                    className="glass-input w-full"
                                    placeholder="e.g. Spouse, Parent, Sibling"
                                />
                                {errors.emergency_contact_relation && <p className="text-red-500 text-sm mt-1">{errors.emergency_contact_relation}</p>}
                            </div>

                            <div className="pt-4">
                                <button type="submit" disabled={processing} className="glass-button w-full flex items-center justify-center gap-2">
                                    {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
