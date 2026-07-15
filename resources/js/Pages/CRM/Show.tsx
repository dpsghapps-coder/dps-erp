import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge } from '@/Components/ui';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Pencil, Phone, Mail, MapPin, Calendar, User, Plus, Clock } from 'lucide-react';

export default function ClientShow() {
    const { client } = usePage().props as any;
    const interactionForm = useForm({
        type: 'note',
        subject: '',
        body: '',
        occurred_at: new Date().toISOString().slice(0, 16),
    });

    return (
        <AppLayout>
            <Head title={client?.company_name || 'Client'} />

            <div className="mb-6">
                <Link href="/crm" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Clients
                </Link>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <GlassCard>
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-semibold">{client?.company_name}</h1>
                                {client?.industry && <p className="text-slate-400">{client.industry}</p>}
                            </div>
                            <Link href={`/crm/${client?.id}/edit`} className="glass-button flex items-center gap-2">
                                <Pencil className="w-4 h-4" /> Edit
                            </Link>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {client?.email && (
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Email</p>
                                        <p>{client.email}</p>
                                    </div>
                                </div>
                            )}
                            {client?.phone && (
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Phone</p>
                                        <p>{client.phone}</p>
                                    </div>
                                </div>
                            )}
                            {(client?.city || client?.country) && (
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Location</p>
                                        <p>{[client?.city, client?.country].filter(Boolean).join(', ')}</p>
                                    </div>
                                </div>
                            )}
                            {client?.source && (
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Source</p>
                                        <p>{client.source}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {client?.address && (
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <p className="text-xs text-slate-500 mb-1">Address</p>
                                <p className="whitespace-pre-wrap">{client.address}</p>
                            </div>
                        )}

                        {client?.notes && (
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <p className="text-xs text-slate-500 mb-1">Notes</p>
                                <p className="whitespace-pre-wrap text-slate-300">{client.notes}</p>
                            </div>
                        )}
                    </GlassCard>

                    {/* Contacts */}
                    <GlassCard>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Contacts</h2>
                            <button className="glass-button flex items-center gap-2 text-sm">
                                <Plus className="w-4 h-4" /> Add Contact
                            </button>
                        </div>
                        {client?.contacts?.length > 0 ? (
                            <div className="space-y-3">
                                {client.contacts.map((contact: any) => (
                                    <div key={contact.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                        <div>
                                            <p className="font-medium">
                                                {contact.first_name} {contact.last_name}
                                                {contact.is_primary && <span className="ml-2 text-xs bg-white/10 px-2 py-0.5 rounded">Primary</span>}
                                            </p>
                                            <p className="text-sm text-slate-400">{contact.job_title}</p>
                                        </div>
                                        <div className="text-right text-sm">
                                            {contact.email && <p className="text-slate-400">{contact.email}</p>}
                                            {contact.phone && <p className="text-slate-400">{contact.phone}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400">No contacts added</p>
                        )}
                    </GlassCard>

                    {/* Interactions Timeline */}
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4">Interactions</h2>
                        
                        <form className="mb-6 p-4 bg-white/5 rounded-lg">
                            <h3 className="text-sm font-medium mb-3">Log New Interaction</h3>
                            <div className="grid md:grid-cols-2 gap-4 mb-3">
                                <select className="glass-input">
                                    <option value="note">Note</option>
                                    <option value="call">Call</option>
                                    <option value="email">Email</option>
                                    <option value="meeting">Meeting</option>
                                </select>
                                <input type="text" placeholder="Subject" className="glass-input" />
                            </div>
                            <textarea placeholder="Details..." className="glass-input w-full h-20 mb-3" />
                            <button type="button" className="glass-button text-sm">Log Interaction</button>
                        </form>

                        {client?.interactions?.length > 0 ? (
                            <div className="relative">
                                <div className="absolute left-4 top-0 bottom-0 w-px bg-white/10"></div>
                                <div className="space-y-4">
                                    {client.interactions.map((interaction: any) => (
                                        <div key={interaction.id} className="flex gap-4 relative">
                                            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center z-10">
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 p-3 bg-white/5 rounded-lg">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-medium">{interaction.subject}</span>
                                                    <span className={`status-badge text-xs ${interaction.type === 'call' ? 'text-blue-400' : interaction.type === 'email' ? 'text-yellow-400' : 'text-slate-400'}`}>
                                                        {interaction.type}
                                                    </span>
                                                </div>
                                                {interaction.body && <p className="text-sm text-slate-400">{interaction.body}</p>}
                                                <p className="text-xs text-slate-500 mt-2">
                                                    {interaction.user?.name} • {new Date(interaction.occurred_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-400">No interactions logged yet</p>
                        )}
                    </GlassCard>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <GlassCard>
                        <h3 className="text-sm font-medium text-slate-400 mb-3">Status</h3>
                        <select className="glass-input w-full" defaultValue={client?.status}>
                            <option value="lead">Lead</option>
                            <option value="prospect">Prospect</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </GlassCard>

                    <GlassCard>
                        <h3 className="text-sm font-medium text-slate-400 mb-3">Assigned To</h3>
                        {client?.assigned_to ? (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                                    <span className="text-sm">{client.assigned_to.name?.charAt(0)}</span>
                                </div>
                                <p>{client.assigned_to.name}</p>
                            </div>
                        ) : (
                            <p className="text-slate-400">Unassigned</p>
                        )}
                    </GlassCard>

                    <GlassCard>
                        <h3 className="text-sm font-medium text-slate-400 mb-3">Associated Orders</h3>
                        {client?.orders?.length > 0 ? (
                            <div className="space-y-2">
                                {client.orders.map((order: any) => (
                                    <Link key={order.id} href={`/orders/${order.id}`} className="block p-2 bg-white/5 rounded hover:bg-white/10">
                                        <p className="font-medium text-sm">{order.order_number}</p>
                                        <p className="text-xs text-slate-400">${order.grand_total}</p>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 text-sm">No orders</p>
                        )}
                    </GlassCard>
                </div>
            </div>
        </AppLayout>
    );
}