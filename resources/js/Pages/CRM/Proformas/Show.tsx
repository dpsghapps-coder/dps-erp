import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Pencil, Printer } from 'lucide-react';
import { useCurrency } from '@/Utils/currency';
import WhatsAppLink from '@/Components/WhatsAppLink';

const COMPANY = {
    name: 'DP Solutions Ghana Limited',
    tagline: 'Total Printing Solutions',
    address: 'Mamprobi-Accra',
    emails: ['dpsolutionsghana@gmail.com', 'dpsolutionsjobs@gmail.com'],
    phones: ['0245959796', '0209296164', '0209296165'],
    accounts: [
        { bank: 'Fidelity Bank', number: '1050627093212', holder: 'DP Solutions Ghana Limited' },
        { bank: 'Mobile Money', number: '0597393473', holder: 'DP Solutions Ghana' },
        { bank: 'Mobile Money', number: '0241149975', holder: 'DP Solutions Ghana' },
    ],
};

const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-slate-500/20 text-slate-400',
    sent: 'bg-blue-500/20 text-blue-400',
    accepted: 'bg-green-500/20 text-green-400',
    rejected: 'bg-red-500/20 text-red-400',
};

const DEFAULT_TERMS = [
    'Valid for 2 weeks from date of issue.',
    'Prices are in Ghana Cedis (GHC) and exclude VAT unless stated.',
    'All work to commence upon receipt of deposit.',
];

export default function ProformaShow() {
    const { client, proforma } = usePage().props as any;
    const formatCurrency = useCurrency();

    const terms = proforma?.terms
        ? proforma.terms.split('\n').filter(Boolean)
        : DEFAULT_TERMS;

    const handlePrint = () => window.print();

    return (
        <>
            <Head title={`${proforma?.number} — ${client?.company_name}`} />

            {/* Screen-only controls */}
            <div className="no-print mb-6">
                <Link href={`/crm/${client?.id}/proformas`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Proformas
                </Link>
            </div>

            <div className="no-print flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_COLORS[proforma?.status] || ''}`}>
                        {proforma?.status?.charAt(0).toUpperCase()}{proforma?.status?.slice(1)}
                    </span>
                    {proforma?.deal ? (
                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400">
                            {proforma.deal.type === 'repeat_business' ? 'Sales Campaign' : 'New Lead'} · {proforma.deal.stage.replace(/_/g, ' ')}
                        </span>
                    ) : (
                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-500/20 text-slate-400">
                            Standalone (no deal)
                        </span>
                    )}
                </div>
                <div className="flex gap-3">
                    <Link href={`/crm/${client?.id}/proformas/${proforma?.id}/edit`} className="glass-button flex items-center gap-2 text-sm">
                        <Pencil className="w-4 h-4" /> Edit
                    </Link>
                    <button onClick={handlePrint} className="glass-button flex items-center gap-2 text-sm">
                        <Printer className="w-4 h-4" /> Print / PDF
                    </button>
                </div>
            </div>

            {/* Invoice document */}
            <div className="bg-white text-gray-900 rounded-lg shadow-lg max-w-[900px] mx-auto" id="invoice-print">
                <style>{`
                    @media print {
                        .no-print { display: none !important; }
                        body { background: white !important; margin: 0; padding: 0; }
                        #invoice-print {
                            box-shadow: none !important;
                            border-radius: 0 !important;
                            max-width: 100% !important;
                            margin: 0 !important;
                            padding: 20px !important;
                            page-break-inside: avoid;
                        }
                        @page { margin: 15mm; size: A4; }
                    }
                `}</style>

                {/* Header */}
                <div className="p-8 pb-6 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{COMPANY.name}</h1>
                            <p className="text-sm text-gray-500 italic">{COMPANY.tagline}</p>
                            <p className="text-sm text-gray-500 mt-1">{COMPANY.address}</p>
                            <div className="text-sm text-gray-500 mt-1">
                                {COMPANY.emails.map(e => <div key={e}>{e}</div>)}
                                <div className="flex flex-wrap gap-x-2">
                                    {COMPANY.phones.map((p, i) => (
                                        <span key={p} className="flex items-center gap-1">
                                            {i > 0 && <span>/</span>}
                                            <WhatsAppLink phone={p} className="text-blue-600 hover:underline">{p}</WhatsAppLink>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-3xl font-bold text-indigo-600 mb-2">PROFORMA INVOICE</h2>
                            <div className="text-sm space-y-1">
                                <div><span className="font-medium">No:</span> {proforma?.number}</div>
                                <div><span className="font-medium">Date:</span> {proforma?.date ? new Date(proforma.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</div>
                                {proforma?.valid_until && (
                                    <div><span className="font-medium">Valid Until:</span> {new Date(proforma.valid_until).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bill To */}
                <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
                    <div className="text-sm">
                        <p className="font-medium text-gray-500 uppercase tracking-wide mb-1">Bill To</p>
                        <p className="font-semibold text-lg text-gray-900">{client?.company_name}</p>
                        {client?.phone && (
                            <WhatsAppLink phone={client.phone} className="text-blue-600 hover:underline flex items-center gap-1">
                                <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                {client.phone}
                            </WhatsAppLink>
                        )}
                        {[client?.address, client?.city, client?.country].filter(Boolean).join(', ') && (
                            <p className="text-gray-600">{[client?.address, client?.city, client?.country].filter(Boolean).join(', ')}</p>
                        )}
                    </div>
                </div>

                {/* Line Items Table */}
                <div className="px-8 py-6">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b-2 border-gray-900">
                                <th className="text-left py-2 w-10 font-semibold">SN</th>
                                <th className="text-left py-2 font-semibold">Item Description</th>
                                <th className="text-center py-2 w-20 font-semibold">Qty</th>
                                <th className="text-right py-2 w-28 font-semibold">Unit Cost</th>
                                <th className="text-right py-2 w-28 font-semibold">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proforma?.items?.map((item: any, index: number) => (
                                <tr key={index} className="border-b border-gray-200">
                                    <td className="py-3 text-gray-500">{index + 1}</td>
                                    <td className="py-3">
                                        <div className="font-medium text-gray-900">{item.description}</div>
                                        {item.specs && <div className="text-xs text-gray-500 mt-0.5">{item.specs}</div>}
                                    </td>
                                    <td className="py-3 text-center">{item.quantity}</td>
                                    <td className="py-3 text-right">{formatCurrency(item.unit_cost)}</td>
                                    <td className="py-3 text-right font-medium">{formatCurrency(item.quantity * item.unit_cost)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mt-6">
                        <div className="w-80 space-y-2 text-sm">
                            <div className="flex justify-between py-1">
                                <span className="text-gray-500">Tax Exclusive Value</span>
                                <span>{formatCurrency(proforma?.subtotal)}</span>
                            </div>
                            {proforma?.discount > 0 && (
                                <div className="flex justify-between py-1 text-red-600">
                                    <span>Discount {proforma?.discount_type === 'percentage' ? `(${proforma.discount}%)` : ''}</span>
                                    <span>-{formatCurrency(proforma?.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between py-1">
                                <span className="text-gray-500">VAT ({proforma?.vat_rate}%)</span>
                                <span>{formatCurrency(proforma?.vat_amount)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-t-2 border-gray-900 font-bold text-lg">
                                <span>TOTAL VALUE</span>
                                <span>{formatCurrency(proforma?.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Milestones */}
                <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
                    <h3 className="font-semibold text-gray-900 mb-3">Payment Terms</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 border border-gray-200 rounded-lg bg-white">
                            <div className="text-xs font-medium text-gray-500 uppercase">{proforma?.deposit_rate}% Deposit Required Before Production</div>
                            <div className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(proforma?.deposit_amount)}</div>
                        </div>
                        <div className="p-3 border border-gray-200 rounded-lg bg-white">
                            <div className="text-xs font-medium text-gray-500 uppercase">{proforma?.balance_rate}% Balance Due Upon Delivery</div>
                            <div className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(proforma?.balance_amount)}</div>
                        </div>
                    </div>
                </div>

                {/* Payment Accounts */}
                <div className="px-8 py-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Payment Accounts</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {COMPANY.accounts.map((account, i) => (
                            <div key={i} className="p-3 border border-gray-200 rounded-lg">
                                <div className="text-xs font-medium text-gray-500 uppercase">{account.bank}</div>
                                <div className="font-semibold text-gray-900 mt-1">{account.number}</div>
                                <div className="text-xs text-gray-500">{account.holder}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Terms & Conditions */}
                {terms.length > 0 && (
                    <div className="px-8 py-6 border-t border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h3>
                        <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                            {terms.map((term: string, i: number) => (
                                <li key={i}>{term}</li>
                            ))}
                        </ol>
                    </div>
                )}

                {/* Notes */}
                {proforma?.notes && (
                    <div className="px-8 py-4 border-t border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-1">Notes</h3>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{proforma.notes}</p>
                    </div>
                )}

                {/* Sign-off */}
                <div className="px-8 py-6 border-t border-gray-200">
                    <div className="flex justify-between items-end">
                        <div className="text-sm text-gray-500">
                            <p>Thank you for your business!</p>
                        </div>
                        {proforma?.rep_name && (
                            <div className="text-right text-sm">
                                <p className="text-gray-500">Customer Relationship Rep</p>
                                <p className="font-semibold text-gray-900 text-base">{proforma.rep_name}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom spacer */}
            <div className="no-print h-12" />
        </>
    );
}
