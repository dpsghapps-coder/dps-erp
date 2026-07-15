import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Mail, MapPin, User, Building2, Smartphone, Map, Eye, X } from 'lucide-react';
import { useState } from 'react';

export default function SuppliersShow() {
    const { supplier } = usePage().props as any;
    const [showAllBranches, setShowAllBranches] = useState(false);
    const branches = supplier.branches || [];
    const visibleBranches = branches.slice(0, 2);
    const hasMore = branches.length > 2;

    return (
        <AppLayout>
            <Head title={supplier.company_name} />

            <div className="mb-6">
                <Link href="/inventory/suppliers" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Suppliers
                </Link>
            </div>

            <PageHeader
                title={supplier.company_name}
                subtitle="Supplier Details"
            />

            <GlassCard>
                {branches.length > 0 && (
                    <div>
                        <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
                            <Building2 className="w-4 h-4" /> Branches / Departments / Contacts ({branches.length})
                        </h3>
                        <div className="grid gap-3">
                            {visibleBranches.map((branch: any) => (
                                <BranchCard key={branch.id} branch={branch} />
                            ))}
                        </div>
                        {hasMore && (
                            <button onClick={() => setShowAllBranches(true)} className="mt-3 glass-button-secondary text-sm py-2 px-4 inline-flex items-center gap-2">
                                <Eye className="w-4 h-4" /> View Other Branches ({branches.length - 2} more)
                            </button>
                        )}
                    </div>
                )}
            </GlassCard>

            {showAllBranches && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Building2 className="w-5 h-5" /> All Branches / Departments
                            </h3>
                            <button onClick={() => setShowAllBranches(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="grid gap-3">
                            {branches.map((branch: any) => (
                                <BranchCard key={branch.id} branch={branch} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

function BranchCard({ branch }: { branch: any }) {
    return (
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <p className="font-medium text-slate-900 mb-2">{branch.name}</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
                {branch.contact_name && (
                    <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" /> {branch.contact_name}
                    </span>
                )}
                {branch.mobile && (
                    <span className="flex items-center gap-1">
                        <Smartphone className="w-3.5 h-3.5 text-slate-400" /> {branch.mobile}
                    </span>
                )}
                {branch.email && (
                    <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> {branch.email}
                    </span>
                )}
            </div>
            {branch.address && (
                <p className="text-sm text-slate-600 mt-2 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" /> {branch.address}
                </p>
            )}
            {branch.location && (
                <p className="text-sm text-slate-600 mt-1">
                    <Map className="w-3.5 h-3.5 text-slate-400 inline mr-1" />
                    <a href={`https://www.google.com/maps?q=${branch.location}`} target="_blank" className="hover:underline">View on Map</a>
                </p>
            )}
        </div>
    );
}
