import { useRef, useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import html2canvas from 'html2canvas';
import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge } from '@/Components/ui';
import { useCurrency } from '@/Utils/currency';
import { ArrowLeft, FileText, Image as ImageIcon, MessageCircle, Copy, Check, X, PackageCheck, Truck, PlusCircle } from 'lucide-react';

export default function ProcurementShow() {
    const { purchase_order: po, auth, canMarkOrdered } = usePage().props as any;
    const formatCurrency = useCurrency();
    const printableRef = useRef<HTMLDivElement>(null);
    const [capturing, setCapturing] = useState(false);
    const [showWhatsappModal, setShowWhatsappModal] = useState(false);
    const [whatsappText, setWhatsappText] = useState('');
    const [loadingWhatsapp, setLoadingWhatsapp] = useState(false);
    const [copied, setCopied] = useState(false);
    const [pullingStock, setPullingStock] = useState(false);
    const [markingOrdered, setMarkingOrdered] = useState(false);

    const branch = po.supplier?.branches?.[0];
    const permissions: string[] = auth?.permissions || [];
    const canPullStock = permissions.includes('procurement.close')
        && !po.purchase_request
        && !po.stock_pulled_at
        && po.status !== 'draft';

    const handlePullToStock = () => {
        if (!confirm('Pull this PO\'s items into Stock? This will mark the PO as closed.')) return;
        setPullingStock(true);
        router.post(`/procurement/${po.id}/pull-to-stock`, {}, {
            onFinish: () => setPullingStock(false),
        });
    };

    const handleMarkOrdered = () => {
        setMarkingOrdered(true);
        router.post(`/procurement/${po.id}/mark-ordered`, {}, {
            onFinish: () => setMarkingOrdered(false),
        });
    };

    const addToStockHref = (item: any) => {
        const prefill = {
            product_id: item.product_id,
            category: item.product?.item_category || '',
            supplier_id: po.supplier_id,
            purchase_order_id: po.id,
            purchase_order_item_id: item.id,
            qty: item.qty,
            unit_cost: item.unit_cost,
            source: po.po_number,
        };

        return `/inventory/stock?prefill=${encodeURIComponent(JSON.stringify(prefill))}`;
    };

    const handleDownloadImage = async () => {
        if (!printableRef.current) return;
        setCapturing(true);
        try {
            const canvas = await html2canvas(printableRef.current, { backgroundColor: '#ffffff', scale: 2 });
            const link = document.createElement('a');
            link.download = `PO-${po.po_number}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } finally {
            setCapturing(false);
        }
    };

    const handleOpenWhatsappModal = async () => {
        setShowWhatsappModal(true);
        setCopied(false);
        setLoadingWhatsapp(true);
        try {
            const response = await fetch(`/procurement/${po.id}/whatsapp`);
            setWhatsappText(await response.text());
        } finally {
            setLoadingWhatsapp(false);
        }
    };

    const handleCopyWhatsapp = async () => {
        await navigator.clipboard.writeText(whatsappText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AppLayout>
            <Head title={`Purchase Order ${po.po_number}`} />

            <PageHeader
                title={`Purchase Order ${po.po_number}`}
                subtitle={po.supplier?.company_name}
                action={
                    <Link href="/procurement/orders" className="glass-button-secondary flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Orders
                    </Link>
                }
            />

            <div className="flex flex-wrap gap-3 mb-6">
                {canMarkOrdered && po.status === 'draft' && (
                    <button onClick={handleMarkOrdered} disabled={markingOrdered} className="glass-button flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
                        <Truck className="w-4 h-4" /> {markingOrdered ? 'Marking...' : 'Mark as Ordered'}
                    </button>
                )}
                <a href={`/procurement/${po.id}/pdf`} className="glass-button flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Download PDF
                </a>
                <button onClick={handleDownloadImage} disabled={capturing} className="glass-button-secondary flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> {capturing ? 'Capturing...' : 'Download Image'}
                </button>
                <button onClick={handleOpenWhatsappModal} className="glass-button-secondary flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" /> WhatsApp Text
                </button>
                {canPullStock && (
                    <button onClick={handlePullToStock} disabled={pullingStock} className="glass-button flex items-center gap-2 bg-green-600 hover:bg-green-700">
                        <PackageCheck className="w-4 h-4" /> {pullingStock ? 'Pulling...' : 'Pull to Stock'}
                    </button>
                )}
                {po.stock_pulled_at && (
                    <span className="glass-button-secondary flex items-center gap-2 cursor-default opacity-75">
                        <PackageCheck className="w-4 h-4" /> Stock Pulled
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div ref={printableRef} className="bg-white dark:bg-white p-6 rounded-xl">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">DP Solutions Ghana Limited</h2>
                                <p className="text-xs text-slate-500 italic">Total Printing Solutions</p>
                                <p className="text-xs text-slate-500 mt-1">dpsolutionsghana@gmail.com · 0245959796</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold text-indigo-600">PURCHASE ORDER</p>
                                <p className="text-xs text-slate-500 mt-1">No: {po.po_number}</p>
                                <p className="text-xs text-slate-500">Date: {new Date(po.created_at).toLocaleDateString()}</p>
                                {po.expected_date && <p className="text-xs text-slate-500">Expected: {new Date(po.expected_date).toLocaleDateString()}</p>}
                                <div className="mt-1"><StatusBadge status={po.status} /></div>
                            </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-6">
                            <p className="text-[10px] uppercase tracking-wide text-slate-500">Supplier</p>
                            <p className="text-sm font-semibold text-slate-900">{po.supplier?.company_name}</p>
                            {branch?.contact_name && <p className="text-xs text-slate-500">Attn: {branch.contact_name}</p>}
                            {branch?.mobile && <p className="text-xs text-slate-500">{branch.mobile}</p>}
                            {branch?.address && <p className="text-xs text-slate-500">{branch.address}</p>}
                        </div>

                        <table className="w-full mb-4">
                            <thead>
                                <tr className="border-b-2 border-slate-900 text-left text-[10px] uppercase tracking-wider text-slate-500">
                                    <th className="py-2 px-1">#</th>
                                    <th className="py-2 px-1">Item</th>
                                    <th className="py-2 px-1 text-center">Qty</th>
                                    <th className="py-2 px-1 text-right">Unit Cost</th>
                                    <th className="py-2 px-1 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(po.items || []).map((item: any, i: number) => (
                                    <tr key={item.id} className="border-b border-slate-100">
                                        <td className="py-2 px-1 text-slate-400 text-sm">{i + 1}</td>
                                        <td className="py-2 px-1 text-sm text-slate-900">{item.display_name}</td>
                                        <td className="py-2 px-1 text-sm text-center text-slate-700">{item.qty}</td>
                                        <td className="py-2 px-1 text-sm text-right text-slate-700">{formatCurrency(item.unit_cost)}</td>
                                        <td className="py-2 px-1 text-sm text-right font-medium text-slate-900">{formatCurrency(item.line_total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="flex justify-end">
                            <div className="w-56 pt-3 border-t-2 border-slate-900 flex justify-between text-base font-bold text-slate-900">
                                <span>Total</span>
                                <span>{formatCurrency(po.total_amount)}</span>
                            </div>
                        </div>

                        {po.notes && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <p className="text-xs font-semibold text-slate-700">Notes</p>
                                <p className="text-xs text-slate-500 whitespace-pre-wrap">{po.notes}</p>
                            </div>
                        )}
                    </div>

                    {po.status !== 'draft' && !po.stock_pulled_at && (
                        <GlassCard>
                            <h3 className="text-lg font-semibold mb-1 text-slate-900 dark:text-white">Add Items to Stock</h3>
                            <p className="text-sm text-slate-500 mb-4">
                                Opens the Stock module with the product, supplier, and cost pre-filled from this PO -- review and adjust before saving.
                            </p>
                            <div className="space-y-2">
                                {(po.items || []).filter((item: any) => item.product_type !== 'App\\Models\\Good').map((item: any) => {
                                    const alreadyInStock = (item.stocks || []).length > 0;
                                    return (
                                        <div key={item.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 dark:bg-white/5">
                                            <span className="text-sm text-slate-700 dark:text-slate-300">{item.display_name}</span>
                                            {alreadyInStock ? (
                                                <span className="text-xs text-green-600 flex items-center gap-1.5 py-1.5 px-3">
                                                    <Check className="w-3.5 h-3.5" /> Already in Stock
                                                </span>
                                            ) : (
                                                <a href={addToStockHref(item)} className="glass-button-secondary text-xs flex items-center gap-1.5 py-1.5 px-3">
                                                    <PlusCircle className="w-3.5 h-3.5" /> Add to Stock
                                                </a>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </GlassCard>
                    )}
                </div>

                <div className="space-y-6">
                    <GlassCard>
                        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Details</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Created by</span>
                                <span>{po.created_by?.name || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Created</span>
                                <span>{new Date(po.created_at).toLocaleDateString()}</span>
                            </div>
                            {po.purchase_request && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500">From PR</span>
                                    <Link href={`/procurement/purchase-requests/${po.purchase_request.id}`} className="text-indigo-600 hover:underline font-medium">
                                        {po.purchase_request.pr_number}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>
            </div>

            {showWhatsappModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">WhatsApp Message</h3>
                            <button onClick={() => setShowWhatsappModal(false)} className="text-slate-500 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <textarea
                            readOnly
                            value={loadingWhatsapp ? 'Loading...' : whatsappText}
                            className="glass-input w-full h-64 font-mono text-xs"
                            onFocus={(e) => e.target.select()}
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={() => setShowWhatsappModal(false)} className="flex-1 glass-button-secondary py-2.5">
                                Close
                            </button>
                            <button
                                onClick={handleCopyWhatsapp}
                                disabled={loadingWhatsapp}
                                className="flex-1 glass-button flex items-center justify-center gap-2 py-2.5"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
