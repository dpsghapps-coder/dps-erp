import { useRef, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import html2canvas from 'html2canvas';
import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge } from '@/Components/ui';
import { useCurrency } from '@/Utils/currency';
import { ArrowLeft, FileText, Image as ImageIcon, MessageCircle } from 'lucide-react';

export default function ProcurementShow() {
    const { purchase_order: po } = usePage().props as any;
    const formatCurrency = useCurrency();
    const printableRef = useRef<HTMLDivElement>(null);
    const [capturing, setCapturing] = useState(false);

    const branch = po.supplier?.branches?.[0];

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
                <a href={`/procurement/${po.id}/pdf`} className="glass-button flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Download PDF
                </a>
                <button onClick={handleDownloadImage} disabled={capturing} className="glass-button-secondary flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> {capturing ? 'Capturing...' : 'Download Image'}
                </button>
                <a href={`/procurement/${po.id}/whatsapp`} className="glass-button-secondary flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" /> WhatsApp Text
                </a>
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
        </AppLayout>
    );
}
