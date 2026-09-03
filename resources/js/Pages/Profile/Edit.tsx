import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { Camera, User, Mail, Shield, Building2, Briefcase, Calendar, Phone, Lock, Bell, Save, X } from 'lucide-react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import WhatsAppLink from '@/Components/WhatsAppLink';

interface UserData {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    role: { name: string } | null;
    employee: {
        employee_number: string;
        first_name: string;
        last_name: string;
        email: string;
        job_title: string;
        mobile_1: string;
        mobile_2: string;
        date_hired: string;
        department: { name: string } | null;
        staff_level: { name: string } | null;
        employment_type: { name: string } | null;
    } | null;
    notification_preferences: {
        procurement: boolean;
        orders: boolean;
        inventory: boolean;
        hrm: boolean;
        chat_messages: boolean;
    };
}

export default function Edit() {
    const { user } = usePage().props as any;
    const avatarInput = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        user.employee?.avatar ? `/storage/${user.employee.avatar}` : null
    );

    const { data, setData, post, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
        avatar: null as File | null,
    });

    const notifForm = useForm({
        procurement: user.notification_preferences.procurement,
        orders: user.notification_preferences.orders,
        inventory: user.notification_preferences.inventory,
        hrm: user.notification_preferences.hrm,
        chat_messages: user.notification_preferences.chat_messages,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('profile.update'), {
            forceFormData: true,
        });
    };

    const submitNotifications: FormEventHandler = (e) => {
        e.preventDefault();
        notifForm.put(route('profile.notification-preferences'));
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('avatar', file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const removeAvatar = () => {
        setData('avatar', null);
        setAvatarPreview(null);
    };

    const roleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-700';
            case 'manager': return 'bg-amber-100 text-amber-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <AppLayout>
            <Head title="My Profile" />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">My Profile</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account settings and preferences</p>
                </div>

                {/* Profile Photo + Basic Info */}
                <div className="bg-white dark:bg-[#1a1e2a] rounded-xl border border-slate-200 dark:border-white/[0.06] overflow-hidden">
                    {/* Avatar Banner */}
                    <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
                        <div className="absolute -bottom-12 left-6">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-2xl bg-white dark:bg-[#1a1e2a] border-4 border-white dark:border-[#1a1e2a] overflow-hidden shadow-lg">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                            <span className="text-3xl font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => avatarInput.current?.click()}
                                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-600"
                                >
                                    <Camera className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                                </button>
                                <input
                                    ref={avatarInput}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </div>

                    {/* User Info Header */}
                    <div className="pt-14 px-6 pb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{user.name}</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                        </div>
                        {user.role && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${roleBadgeColor(user.role.name)}`}>
                                {user.role.name}
                            </span>
                        )}
                    </div>
                </div>

                {/* Profile Information */}
                <div className="bg-white dark:bg-[#1a1e2a] rounded-xl border border-slate-200 dark:border-white/[0.06] p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center">
                            <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Profile Information</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Update your name and email address</p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Full Name" />
                            <TextInput
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                isFocused
                                autoComplete="name"
                            />
                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="Email Address" />
                            <TextInput
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                            />
                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        <div className="flex items-center gap-4 pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-green-600">Saved.</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                {/* Role & Department Info (Read-only) */}
                <div className="bg-white dark:bg-[#1a1e2a] rounded-xl border border-slate-200 dark:border-white/[0.06] p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/10 rounded-xl flex items-center justify-center">
                            <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Role & Department</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Your system role and department assignment</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-lg border border-slate-100 dark:border-white/[0.06]">
                            <div className="flex items-center gap-2 mb-1">
                                <Shield className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Role</span>
                            </div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 capitalize">{user.role?.name || 'Not assigned'}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-lg border border-slate-100 dark:border-white/[0.06]">
                            <div className="flex items-center gap-2 mb-1">
                                <Building2 className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Department</span>
                            </div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.employee?.department?.name || 'Not assigned'}</p>
                        </div>
                    </div>
                </div>

                {/* Employee Details (if linked) */}
                {user.employee && (
                    <div className="bg-white dark:bg-[#1a1e2a] rounded-xl border border-slate-200 dark:border-white/[0.06] p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Employee Details</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Your employee record information</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-lg border border-slate-100 dark:border-white/[0.06]">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Employee #</span>
                                </div>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.employee.employee_number}</p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-lg border border-slate-100 dark:border-white/[0.06]">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Job Title</span>
                                </div>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.employee.job_title || 'Not set'}</p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-lg border border-slate-100 dark:border-white/[0.06]">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Staff Level</span>
                                </div>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.employee.staff_level?.name || 'Not set'}</p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-lg border border-slate-100 dark:border-white/[0.06]">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Employment Type</span>
                                </div>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.employee.employment_type?.name || 'Not set'}</p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-lg border border-slate-100 dark:border-white/[0.06]">
                                <div className="flex items-center gap-2 mb-1">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Mobile</span>
                                </div>
                                <WhatsAppLink phone={user.employee.mobile_1} className="text-sm font-medium text-green-600 dark:text-green-400 hover:underline flex items-center gap-1">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                    {user.employee.mobile_1 || 'Not set'}
                                </WhatsAppLink>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-lg border border-slate-100 dark:border-white/[0.06]">
                                <div className="flex items-center gap-2 mb-1">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Date Hired</span>
                                </div>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    {user.employee.date_hired ? new Date(user.employee.date_hired).toLocaleDateString() : 'Not set'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notification Preferences */}
                <div className="bg-white dark:bg-[#1a1e2a] rounded-xl border border-slate-200 dark:border-white/[0.06] p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-rose-100 dark:bg-rose-500/10 rounded-xl flex items-center justify-center">
                            <Bell className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Notification Preferences</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Choose which notifications you want to receive</p>
                        </div>
                    </div>

                    <form onSubmit={submitNotifications} className="space-y-3">
                        {[
                            { key: 'procurement' as const, label: 'Procurement', desc: 'Purchase requests, approvals, and goods receipts' },
                            { key: 'orders' as const, label: 'Orders', desc: 'New orders, status changes, and order updates' },
                            { key: 'inventory' as const, label: 'Inventory', desc: 'Stock alerts, low inventory warnings, and requisitions' },
                            { key: 'hrm' as const, label: 'HRM', desc: 'Leave requests, approvals, and HR announcements' },
                            { key: 'chat_messages' as const, label: 'Chat Messages', desc: 'Direct messages and group conversation notifications' },
                        ].map((item) => (
                            <label
                                key={item.key}
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                            >
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.label}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                                </div>
                                <div className="relative inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={notifForm.data[item.key]}
                                        onChange={(e) => notifForm.setData(item.key, e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                </div>
                            </label>
                        ))}

                        <div className="flex items-center gap-4 pt-3">
                            <button
                                type="submit"
                                disabled={notifForm.processing}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                {notifForm.processing ? 'Saving...' : 'Save Preferences'}
                            </button>
                            <Transition
                                show={notifForm.recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-green-600">Saved.</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                {/* Update Password */}
                <div className="bg-white dark:bg-[#1a1e2a] rounded-xl border border-slate-200 dark:border-white/[0.06] p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-violet-100 dark:bg-violet-500/10 rounded-xl flex items-center justify-center">
                            <Lock className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Update Password</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Ensure your account is using a strong password</p>
                        </div>
                    </div>

                    <UpdatePasswordSection />
                </div>


            </div>
        </AppLayout>
    );
}

function UpdatePasswordSection() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, put, reset, processing, recentlySuccessful, errors } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <form onSubmit={updatePassword} className="space-y-4">
            <div>
                <InputLabel htmlFor="current_password" value="Current Password" />
                <TextInput
                    id="current_password"
                    ref={currentPasswordInput}
                    value={data.current_password}
                    onChange={(e) => setData('current_password', e.target.value)}
                    type="password"
                    className="mt-1 block w-full"
                    autoComplete="current-password"
                />
                <InputError message={errors.current_password} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="password" value="New Password" />
                <TextInput
                    id="password"
                    ref={passwordInput}
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    type="password"
                    className="mt-1 block w-full"
                    autoComplete="new-password"
                />
                <InputError message={errors.password} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="password_confirmation" value="Confirm New Password" />
                <TextInput
                    id="password_confirmation"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    type="password"
                    className="mt-1 block w-full"
                    autoComplete="new-password"
                />
                <InputError message={errors.password_confirmation} className="mt-2" />
            </div>

            <div className="flex items-center gap-4 pt-2">
                <button
                    type="submit"
                    disabled={processing}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                    <Lock className="w-4 h-4" />
                    {processing ? 'Updating...' : 'Update Password'}
                </button>
                <Transition
                    show={recentlySuccessful}
                    enter="transition ease-in-out"
                    enterFrom="opacity-0"
                    leave="transition ease-in-out"
                    leaveTo="opacity-0"
                >
                    <p className="text-sm text-green-600">Password updated.</p>
                </Transition>
            </div>
        </form>
    );
}

function DeleteAccountSection() {
    const [confirming, setConfirming] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);
    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({ password: '' });

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => { setConfirming(false); reset(); },
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    return (
        <>
            <button
                onClick={() => setConfirming(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
                Delete Account
            </button>

            {confirming && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-[#1a1e2a] rounded-xl border border-slate-200 dark:border-white/[0.06] p-6 max-w-md w-full mx-4 shadow-2xl">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Confirm Account Deletion</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            This action is permanent. Please enter your password to confirm.
                        </p>
                        <form onSubmit={deleteUser} className="space-y-4">
                            <div>
                                <TextInput
                                    ref={passwordInput}
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="block w-full"
                                    placeholder="Enter your password"
                                    autoFocus
                                />
                                <InputError message={errors.password} className="mt-2" />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setConfirming(false); clearErrors(); reset(); }}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                                >
                                    {processing ? 'Deleting...' : 'Delete Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
