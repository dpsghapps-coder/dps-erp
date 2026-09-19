import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Printer, Box, Package, Ruler } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useCurrency } from '@/Utils/currency';

const tabs = [
    { id: 'offset', name: 'Offset Printing', icon: Printer },
    { id: 'largeformat', name: 'Large Format', icon: Ruler },
    { id: 'signage', name: '3D & Signage', icon: Box },
    { id: 'packaging', name: 'Packaging', icon: Package },
] as const;

type TabId = typeof tabs[number]['id'];

interface ServicePrice {
    min_qty: number;
    max_qty: number | null;
    unit_price: number;
}

interface DimensionService {
    id: number;
    name: string;
    unit: string;
    default_price: number;
    prices: ServicePrice[];
}

// Large-format print materials are priced per square meter -- convert
// whatever unit the piece was measured in before looking up a price tier.
const SQM_PER_UNIT: Record<'ft' | 'in', number> = {
    ft: 0.09290304,
    in: 0.00064516,
};

// Matches the pricing logic in Orders Create/Edit exactly: a qty under
// every tier's min_qty (e.g. a sub-1-sqm piece, since tiers start at 1)
// falls back to the service's base rate rather than pricing as free.
function priceForQty(service: DimensionService | undefined, qty: number): number {
    const tiers = service?.prices || [];
    const applicable = tiers
        .filter((p) => qty >= p.min_qty && (p.max_qty === null || qty <= p.max_qty))
        .sort((a, b) => b.min_qty - a.min_qty)[0];

    return applicable ? Number(applicable.unit_price) : Number(service?.default_price || 0);
}

function LargeFormatCalculator({ services }: { services: DimensionService[] }) {
    const formatCurrency = useCurrency();
    const [serviceId, setServiceId] = useState<number | null>(services[0]?.id ?? null);
    const [unit, setUnit] = useState<'ft' | 'in'>('ft');
    const [length, setLength] = useState('');
    const [breadth, setBreadth] = useState('');
    const [pieces, setPieces] = useState('1');

    const selected = services.find((s) => s.id === serviceId);

    const result = useMemo(() => {
        const l = Number(length);
        const b = Number(breadth);
        const qty = Math.max(1, Number(pieces) || 1);

        if (!(l > 0) || !(b > 0) || !selected) return null;

        const areaPerPiece = l * b * SQM_PER_UNIT[unit];
        const totalArea = areaPerPiece * qty;
        const unitPrice = priceForQty(selected, totalArea);

        return {
            areaPerPiece,
            totalArea,
            unitPrice,
            total: totalArea * unitPrice,
        };
    }, [length, breadth, pieces, unit, selected]);

    if (services.length === 0) {
        return (
            <div className="text-center py-16">
                <Box className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">No large format materials configured</h3>
                <p className="text-slate-400 dark:text-slate-500 text-sm max-w-md mx-auto">
                    Add a dimension-based Service (e.g. an LFP print material) in Services to use this calculator.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto space-y-4">
            <div>
                <label className="block text-sm font-medium mb-2">Material</label>
                <div className="grid grid-cols-2 gap-2">
                    {services.map((s) => (
                        <button
                            key={s.id}
                            type="button"
                            onClick={() => setServiceId(s.id)}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors ${
                                serviceId === s.id
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-slate-900 dark:text-white'
                                    : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
                            }`}
                        >
                            <span className="font-medium truncate">{s.name.replace(/^LFP - /, '')}</span>
                            <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                                {formatCurrency(priceForQty(s, 1))}/{s.unit}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Unit</label>
                <div className="inline-flex rounded-lg bg-slate-100 dark:bg-white/5 p-1">
                    {(['ft', 'in'] as const).map((u) => (
                        <button
                            key={u}
                            type="button"
                            onClick={() => setUnit(u)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                unit === u
                                    ? 'bg-white dark:bg-[#1a1e2a] text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400'
                            }`}
                        >
                            {u === 'ft' ? 'Feet' : 'Inches'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="block text-sm font-medium mb-2">Length</label>
                    <input
                        type="number"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        className="glass-input w-full"
                        min="0"
                        step="0.01"
                        placeholder="0"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Breadth</label>
                    <input
                        type="number"
                        value={breadth}
                        onChange={(e) => setBreadth(e.target.value)}
                        className="glass-input w-full"
                        min="0"
                        step="0.01"
                        placeholder="0"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Pieces</label>
                    <input
                        type="number"
                        value={pieces}
                        onChange={(e) => setPieces(e.target.value)}
                        className="glass-input w-full"
                        min="1"
                        step="1"
                    />
                </div>
            </div>

            {result && (
                <div className="bg-indigo-600 rounded-lg p-4 text-white space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-indigo-100">Area per piece</span>
                        <span className="font-medium">{result.areaPerPiece.toFixed(4)} sqm</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-indigo-100">Total area ({pieces || 1} pc)</span>
                        <span className="font-medium">{result.totalArea.toFixed(4)} sqm</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-indigo-100">Rate at this volume</span>
                        <span className="font-medium">{formatCurrency(result.unitPrice)}/sqm</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-indigo-500 text-base">
                        <span className="font-semibold text-indigo-100">Total</span>
                        <span className="font-bold">{formatCurrency(result.total)}</span>
                    </div>
                </div>
            )}

            <p className="text-xs text-slate-400">
                This mirrors the pricing Orders Create/Edit applies -- use it for a quick quote, then add the
                material as a line item on the actual order to charge it.
            </p>
        </div>
    );
}

export default function Calculators() {
    const { dimensionServices } = usePage().props as unknown as { dimensionServices: DimensionService[] };
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

                {activeTab === 'largeformat' && <LargeFormatCalculator services={dimensionServices || []} />}

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
