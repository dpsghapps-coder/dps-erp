import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Star, MapPin, X } from 'lucide-react';
import { SearchableSelect, PhoneInput } from '@/Components/ui';
import GPSMapPicker from '@/Components/GPSMapPicker';
import WhatsAppLink from '@/Components/WhatsAppLink';
import Swal from 'sweetalert2';

interface ClientContactsProps {
    clientId: number;
    contacts: any[];
    regions: string[];
    cities: string[];
    neighbourhoods: string[];
}

export default function ClientContacts({ clientId, contacts, regions, cities, neighbourhoods }: ClientContactsProps) {
    const [showContactForm, setShowContactForm] = useState(false);
    const [showGpsModal, setShowGpsModal] = useState(false);
    const [editingContact, setEditingContact] = useState<any>(null);

    const contactForm = useForm({
        first_name: '',
        last_name: '',
        branch: '',
        location: '',
        region: '',
        city: '',
        neighbourhood: '',
        job_title: '',
        phone: '',
    });

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingContact) {
            contactForm.put(`/crm/${clientId}/contacts/${editingContact.id}`, {
                onSuccess: () => {
                    contactForm.reset();
                    setEditingContact(null);
                    setShowContactForm(false);
                },
            });
        } else {
            contactForm.post(`/crm/${clientId}/contacts`, {
                onSuccess: () => {
                    contactForm.reset();
                    setShowContactForm(false);
                },
            });
        }
    };

    const startEditContact = (contact: any) => {
        setEditingContact(contact);
        contactForm.setData({
            first_name: contact.first_name || '',
            last_name: contact.last_name || '',
            branch: contact.branch || '',
            location: contact.location || '',
            region: contact.region || '',
            city: contact.city || '',
            neighbourhood: contact.neighbourhood || '',
            job_title: contact.job_title || '',
            phone: contact.phone || '',
        });
        setShowContactForm(true);
    };

    const cancelContactForm = () => {
        setShowContactForm(false);
        setEditingContact(null);
        contactForm.reset();
    };

    const handleDeleteContact = (contact: any) => {
        Swal.fire({
            title: 'Remove Contact?',
            text: `${contact.first_name} ${contact.last_name} will be removed from this client.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Remove',
        }).then((res) => {
            if (res.isConfirmed) {
                router.delete(`/crm/${clientId}/contacts/${contact.id}`, { preserveScroll: true });
            }
        });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-400">Contacts</h3>
                {!showContactForm && (
                    <button
                        onClick={() => setShowContactForm(true)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                    >
                        <Plus className="w-3 h-3" /> Add
                    </button>
                )}
            </div>

            {showContactForm && (
                <form onSubmit={handleContactSubmit} className="mb-4 p-3 bg-slate-50 dark:bg-white/5 rounded-lg space-y-2">
                    <h4 className="text-sm font-medium">
                        {editingContact ? 'Edit Contact' : 'Add Contact'}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="text"
                            placeholder="First name *"
                            value={contactForm.data.first_name}
                            onChange={(e) => contactForm.setData('first_name', e.target.value)}
                            className="glass-input text-sm"
                        />
                        <input
                            type="text"
                            placeholder="Last name"
                            value={contactForm.data.last_name}
                            onChange={(e) => contactForm.setData('last_name', e.target.value)}
                            className="glass-input text-sm"
                        />
                    </div>
                    <input
                        type="text"
                        placeholder="Branch"
                        value={contactForm.data.branch}
                        onChange={(e) => contactForm.setData('branch', e.target.value)}
                        className="glass-input text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <SearchableSelect
                            value={contactForm.data.region}
                            onChange={(value) => contactForm.setData('region', value)}
                            options={regions}
                            placeholder="Region"
                            className="glass-input text-sm w-full"
                        />
                        <SearchableSelect
                            value={contactForm.data.city}
                            onChange={(value) => contactForm.setData('city', value)}
                            options={cities}
                            placeholder="City"
                            className="glass-input text-sm w-full"
                        />
                    </div>
                    <SearchableSelect
                        value={contactForm.data.neighbourhood}
                        onChange={(value) => contactForm.setData('neighbourhood', value)}
                        options={neighbourhoods}
                        placeholder="Neighbourhood"
                        className="glass-input text-sm w-full"
                    />
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="GPS location (lat,lng)"
                            value={contactForm.data.location}
                            onChange={(e) => contactForm.setData('location', e.target.value)}
                            className="glass-input text-sm flex-1"
                        />
                        <button
                            type="button"
                            onClick={() => setShowGpsModal(true)}
                            className="glass-button-secondary px-3"
                        >
                            <MapPin className="w-4 h-4" />
                        </button>
                    </div>
                    <input
                        type="text"
                        placeholder="Position"
                        value={contactForm.data.job_title}
                        onChange={(e) => contactForm.setData('job_title', e.target.value)}
                        className="glass-input text-sm"
                    />
                    <PhoneInput
                        value={contactForm.data.phone}
                        onChange={(value) => contactForm.setData('phone', value)}
                        className="glass-input text-sm w-full"
                    />
                    {contactForm.errors.first_name && <p className="text-red-400 text-xs">{contactForm.errors.first_name}</p>}
                    <div className="flex gap-2">
                        <button type="submit" disabled={contactForm.processing} className="glass-button text-xs">
                            {contactForm.processing ? 'Saving...' : editingContact ? 'Update' : 'Save'}
                        </button>
                        <button
                            type="button"
                            onClick={cancelContactForm}
                            className="text-xs text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {contacts?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {contacts.map((contact: any, index: number) => (
                        <div key={contact.id} className="p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex items-center gap-1.5">
                                    <p className="font-medium text-sm">
                                        {contact.first_name} {contact.last_name}
                                    </p>
                                    {index === 0 && (
                                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-medium inline-flex items-center gap-0.5">
                                            <Star className="w-2.5 h-2.5 fill-amber-300" /> Primary
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-0.5 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => startEditContact(contact)}
                                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                        title="Edit contact"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteContact(contact)}
                                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors"
                                        title="Remove contact"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                            {contact.branch && <p className="text-xs text-slate-400">{contact.branch}</p>}
                            {(contact.neighbourhood || contact.city || contact.region) && (
                                <p className="text-xs text-slate-400">
                                    {[contact.neighbourhood, contact.city, contact.region].filter(Boolean).join(', ')}
                                </p>
                            )}
                            {contact.location && (
                                <a
                                    href={`https://www.google.com/maps?q=${contact.location}`}
                                    target="_blank"
                                    className="text-xs text-blue-400 hover:underline"
                                >
                                    GPS: {contact.location}
                                </a>
                            )}
                            {contact.job_title && <p className="text-xs text-slate-400">{contact.job_title}</p>}
                            {contact.phone && (
                                <WhatsAppLink phone={contact.phone} className="text-xs text-green-400 hover:underline flex items-center gap-1">
                                    {contact.phone}
                                </WhatsAppLink>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-slate-400 text-sm">No contacts</p>
            )}

            {showGpsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Pick Location</h3>
                            <button onClick={() => setShowGpsModal(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <GPSMapPicker
                            initialLocation={contactForm.data.location}
                            onSave={(coords) => {
                                contactForm.setData('location', coords);
                                setShowGpsModal(false);
                            }}
                            onClose={() => setShowGpsModal(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
