import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calculator, Printer, Box, Package } from 'lucide-react';
import { useState } from 'react';

const tabs = [
    { id: 'offset', name: 'Offset Printing', icon: Printer },
    { id: 'signage', name: '3D & Signage', icon: Box },
    { id: 'packaging', name: 'Packaging', icon: Package },
] as const;

type TabId = typeof tabs[number]['id'];

export default function Calculators() {
    const [activeTab, setActiveTab] = useState<TabId>('offset');

    return (
        <AppLayout>
            <Head title="Calculators" />

            <div className="mb-6">
                <Link href="/products" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Products
                </Link>
            </div>

            <PageHeader
                title="Calculators"
                subtitle="Calculate pricing for printing, signage, and packaging"
            />

            {/* Tabs */}
            <div className="flex gap-1 mb-6 p-1 bg-slate-100 dark:bg-white/[0.04] rounded-lg w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeTab === tab.id
                                ? 'bg-white dark:bg-[#1a1e2a] text-slate-900 dark:text-slate-100 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.name}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <GlassCard>
                {activeTab === 'offset' && (
                    <div className="text-center py-16">
                        <Printer className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">Offset Printing Calculator</h3>
                        <p className="text-slate-400 dark:text-slate-500 text-sm max-w-md mx-auto">
                            Configure paper size, colors, paper weight, and finishing options to calculate offset printing costs. Coming soon.
                        </p>
                    </div>
                )}

                {activeTab === 'signage' && (
                    <div className="text-center py-16">
                        <Box className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">3D & Signage Calculator</h3>
                        <p className="text-slate-400 dark:text-slate-500 text-sm max-w-md mx-auto">
                            Calculate costs for 3D printing, signage production, and display materials. Coming soon.
                        </p>
                    </div>
                )}

                {activeTab === 'packaging' && (
                    <div className="text-center py-16">
                        <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">Packaging Calculator</h3>
                        <p className="text-slate-400 dark:text-slate-500 text-sm max-w-md mx-auto">
                            Estimate packaging costs based on dimensions, material, quantity, and finishing. Coming soon.
                        </p>
                    </div>
                )}
            </GlassCard>
        </AppLayout>
    );
}
