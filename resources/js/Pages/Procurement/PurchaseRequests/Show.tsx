import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge } from '@/Components/ui';
import ProcurementTabs from '@/Components/ProcurementTabs';
import { Head, usePage, Link, router } from '@inertiajs/react';
import { ArrowLeft, Send, Check, X, MessageSquare, Clock, Pause, FileText, Download, Upload, Search as SearchIcon, Package } from 'lucide-react';
import { useState } from 'react';

const WORKFLOW_STEPS = [
    { key: 'draft', label: 'Draft' },
    { key: 'pending', label: 'Submitted' },
    { key: 'dept_approved', label: 'Dept Review' },
    { key: 'finance_approved', label: 'Finance' },
    { key: 'po_created', label: 'PO Created' },
];

const STATUS_ORDER: Record<string, number> = {
    draft: 0,
    pending: 1,
    queried: 1,
    dept_approved: 2,
    finance_approved: 3,
    held: 3,
    po_created: 4,
    rejected: -1,
    cancelled: -1,
};

function WorkflowStepper({ status }: { status: string }) {
    const currentStep = STATUS_ORDER[status] ?? -1;
    const isRejected = status === 'rejected';
    const isHeld = status === 'held';

    return (
        <div className="flex items-center justify-between mb-8 px-4">
            {WORKFLOW_STEPS.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep && !isRejected && !isHeld;
                const isRejectedStep = isRejected && index === currentStep;
                const isHeldStep = isHeld && index === currentStep;

                return (
                    <div key={step.key} className="flex-1 flex items-center">
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors ${
                                isRejectedStep ? 'bg-red-100 border-red-500 text-red-700' :
                                isHeldStep ? 'bg-purple-100 border-purple-500 text-purple-700' :
                                isCompleted ? 'bg-green-500 border-green-500 text-white' :
                                isActive ? 'bg-indigo-500 border-indigo-500 text-white' :
                                'bg-white border-slate-300 text-slate-400'
                            }`}>
                                {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                            </div>
                            <span className={`text-xs mt-2 font-medium ${
                                isActive ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-slate-400'
                            }`}>{step.label}</span>
                        </div>
                        {index < WORKFLOW_STEPS.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-2 ${
                                index < currentStep && !isRejected && !isHeld ? 'bg-green-500' : 'bg-slate-200'
                            }`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function AuditTimeline({ history }: { history: any[] }) {
    return (
        <div className="space-y-4">
            {history.map((entry: any) => (
                <div key={entry.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-slate-500" />
                        </div>
                        {entry !== history[history.length - 1] && (
                            <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700 mt-1" />
                        )}
                    </div>
                    <div className="pb-4">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {entry.user?.name}
                            <span className="text-slate-500 font-normal"> changed status to </span>
                            <StatusBadge status={entry.status} />
                        </p>
                        {entry.comment && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{entry.comment}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">
                            {new Date(entry.created_at).toLocaleString()}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function PurchaseRequestShow() {
    const { purchaseRequest: pr } = usePage().props as any;
    const user = (usePage().props as any).auth?.user;
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showQueryModal, setShowQueryModal] = useState(false);
    const [showHoldModal, setShowHoldModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showInspectModal, setShowInspectModal] = useState(false);
    const [comment, setComment] = useState('');
    const [postponeUntil, setPostponeUntil] = useState('');
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
    const [inspectionItems, setInspectionItems] = useState<any[]>([]);

    const canApprove = user?.permissions?.some((p: any) => p.name === 'pr.approve');
    const canFinanceReview = user?.permissions?.some((p: any) => p.name === 'pr.finance.review');
    const canInspect = user?.permissions?.some((p: any) => p.name === 'procurement.inspect');
    const canClosePo = user?.permissions?.some((p: any) => p.name === 'procurement.close');
    const canCancel = pr.requester_id === user?.id || canApprove || canFinanceReview;

    const handleDeptReview = (action: string) => {
        router.post(`/procurement/purchase-requests/${pr.id}/dept-review`, {
            action,
            comment: comment || undefined,
        }, {
            onFinish: () => {
                setShowRejectModal(false);
                setShowQueryModal(false);
                setComment('');
            }
        });
    };

    const handleFinanceReview = (action: string) => {
        router.post(`/procurement/purchase-requests/${pr.id}/finance-review`, {
            action,
            comment: comment || undefined,
            postpone_until: postponeUntil || undefined,
        }, {
            onFinish: () => {
                setShowRejectModal(false);
                setShowQueryModal(false);
                setShowHoldModal(false);
                setShowReviewModal(false);
                setComment('');
                setPostponeUntil('');
            }
        });
    };

    const handleSubmit = () => {
        router.post(`/procurement/purchase-requests/${pr.id}/submit`);
    };

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel this PR?')) {
            router.post(`/procurement/purchase-requests/${pr.id}/cancel`);
        }
    };

    const handleUploadReceipt = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        if (receiptFile) formData.append('receipt', receiptFile);
        if (invoiceFile) formData.append('invoice', invoiceFile);

        router.post(`/procurement/purchase-requests/${pr.id}/upload-receipt`, formData, {
            onFinish: () => {
                setShowUploadModal(false);
                setReceiptFile(null);
                setInvoiceFile(null);
            }
        });
    };

    const openInspectModal = () => {
        const items = (pr.purchase_order?.items || []).map((item: any) => ({
            item_id: item.id,
            description: item.description,
            qty: item.qty,
            accepted_qty: item.qty,
            inspection_status: 'accepted',
            inspection_notes: '',
        }));
        setInspectionItems(items);
        setShowInspectModal(true);
    };

    const updateInspectionItem = (index: number, field: string, value: any) => {
        const newItems = [...inspectionItems];
        (newItems[index] as any)[field] = value;
        setInspectionItems(newItems);
    };

    const handleInspection = () => {
        router.post(`/procurement/purchase-requests/${pr.id}/inspect`, {
            items: inspectionItems,
        }, {
            onFinish: () => {
                setShowInspectModal(false);
                setInspectionItems([]);
            }
        });
    };

    const handleClosePo = () => {
        if (confirm('Close this PO? This will auto-create stock entries for accepted items.')) {
            router.post(`/procurement/purchase-requests/${pr.id}/close-po`);
        }
    };

    const poStatus = pr.purchase_order?.status;
    const isPurchased = poStatus === 'purchased';
    const isInspected = poStatus === 'inspected';
    const isOrdered = poStatus === 'ordered';

    return (
        <AppLayout>
            <Head title={`PR ${pr.pr_number}`} />

            <PageHeader
                title={pr.pr_number}
                subtitle={`Created by ${pr.requester?.name} on ${new Date(pr.request_date).toLocaleDateString()}`}
                action={
                    <Link href="/procurement/purchase-requests" className="glass-button-secondary flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to List
                    </Link>
                }
            />

            <ProcurementTabs activeTab="requests" />

            <WorkflowStepper status={pr.status} />

            {pr.status === 'queried' && pr.dept_manager_comment && (
                <GlassCard className="mb-6 border-l-4 border-orange-400">
                    <div className="flex items-start gap-3">
                        <MessageSquare className="w-5 h-5 text-orange-500 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Query from Department Manager</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{pr.dept_manager_comment}</p>
                        </div>
                    </div>
                </GlassCard>
            )}

            {pr.status === 'held' && pr.finance_comment && (
                <GlassCard className="mb-6 border-l-4 border-purple-400">
                    <div className="flex items-start gap-3">
                        <Pause className="w-5 h-5 text-purple-500 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                                Held by Finance — Postponed until {new Date(pr.postpone_until).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{pr.finance_comment}</p>
                        </div>
                    </div>
                </GlassCard>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <GlassCard>
                        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Items</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                        <th className="py-3 px-2">#</th>
                                        <th className="py-3 px-2">Item</th>
                                        <th className="py-3 px-2 text-right">Qty</th>
                                        <th className="py-3 px-2 text-right">Est. Cost</th>
                                        <th className="py-3 px-2 text-right">Total</th>
                                        <th className="py-3 px-2">Attachments</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {pr.items?.map((item: any, index: number) => (
                                        <tr key={item.id}>
                                            <td className="py-3 px-2 text-sm text-slate-500">{index + 1}</td>
                                            <td className="py-3 px-2">
                                                <p className="font-medium">{item.item_name}</p>
                                                {item.item_description && (
                                                    <p className="text-xs text-slate-500">{item.item_description}</p>
                                                )}
                                            </td>
                                            <td className="py-3 px-2 text-right text-sm">{item.qty_requested} {item.uom}</td>
                                            <td className="py-3 px-2 text-right text-sm">${parseFloat(item.estimated_cost).toFixed(2)}</td>
                                            <td className="py-3 px-2 text-right text-sm font-medium">
                                                ${(item.qty_requested * item.estimated_cost).toFixed(2)}
                                            </td>
                                            <td className="py-3 px-2">
                                                {item.attachments?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {item.attachments.map((att: any) => (
                                                            <a
                                                                key={att.id}
                                                                href={`/storage/${att.file_path}`}
                                                                target="_blank"
                                                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                                            >
                                                                <Download className="w-3 h-3" />
                                                                {att.file_name}
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>

                    {/* PO Items with Inspection Status */}
                    {pr.purchase_order && (
                        <GlassCard>
                            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                                Purchase Order — {pr.purchase_order.po_number}
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                            <th className="py-3 px-2">#</th>
                                            <th className="py-3 px-2">Item</th>
                                            <th className="py-3 px-2 text-right">Qty</th>
                                            <th className="py-3 px-2 text-right">Unit Cost</th>
                                            <th className="py-3 px-2 text-right">Total</th>
                                            <th className="py-3 px-2">Inspection</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {pr.purchase_order.items?.map((item: any, index: number) => (
                                            <tr key={item.id}>
                                                <td className="py-3 px-2 text-sm text-slate-500">{index + 1}</td>
                                                <td className="py-3 px-2">
                                                    <p className="font-medium">{item.description}</p>
                                                </td>
                                                <td className="py-3 px-2 text-right text-sm">{item.qty}</td>
                                                <td className="py-3 px-2 text-right text-sm">${parseFloat(item.unit_cost).toFixed(2)}</td>
                                                <td className="py-3 px-2 text-right text-sm font-medium">
                                                    ${parseFloat(item.line_total).toFixed(2)}
                                                </td>
                                                <td className="py-3 px-2">
                                                    {item.inspection_status && item.inspection_status !== 'pending' ? (
                                                        <div className="flex items-center gap-2">
                                                            <StatusBadge status={item.inspection_status} />
                                                            {item.accepted_qty > 0 && item.accepted_qty !== item.qty && (
                                                                <span className="text-xs text-slate-500">
                                                                    ({item.accepted_qty}/{item.qty})
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">Pending</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </GlassCard>
                    )}

                    {pr.history?.length > 0 && (
                        <GlassCard>
                            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Audit Trail</h3>
                            <AuditTimeline history={pr.history} />
                        </GlassCard>
                    )}
                </div>

                <div className="space-y-6">
                    <GlassCard>
                        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Details</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Status</span>
                                <StatusBadge status={pr.status} />
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Priority</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    pr.priority === 'Emergency' ? 'bg-red-100 text-red-800' :
                                    pr.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                                    pr.priority === 'Normal' ? 'bg-blue-100 text-blue-800' :
                                    'bg-slate-100 text-slate-800'
                                }`}>{pr.priority}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Department</span>
                                <span>{pr.department}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Required By</span>
                                <span>{pr.required_by_date ? new Date(pr.required_by_date).toLocaleDateString() : '-'}</span>
                            </div>
                            {pr.supplier && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Supplier</span>
                                    <span>{pr.supplier.company_name}</span>
                                </div>
                            )}
                            {pr.purchase_order && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500">PO</span>
                                    <Link href={`/procurement/${pr.purchase_order.id}`} className="text-blue-600 hover:underline font-mono">
                                        {pr.purchase_order.po_number}
                                    </Link>
                                </div>
                            )}
                            {pr.purchase_order?.status && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500">PO Status</span>
                                    <StatusBadge status={pr.purchase_order.status} />
                                </div>
                            )}
                        </div>
                    </GlassCard>

                    {pr.purpose && (
                        <GlassCard>
                            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Purpose</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{pr.purpose}</p>
                        </GlassCard>
                    )}

                    <GlassCard>
                        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Actions</h3>
                        <div className="space-y-3">
                            {/* Draft actions */}
                            {pr.status === 'draft' && (
                                <>
                                    <button onClick={handleSubmit} className="glass-button w-full flex items-center justify-center gap-2">
                                        <Send className="w-4 h-4" /> Submit for Review
                                    </button>
                                    <Link
                                        href={`/procurement/purchase-requests/${pr.id}/edit`}
                                        className="glass-button-secondary w-full flex items-center justify-center gap-2"
                                    >
                                        Edit PR
                                    </Link>
                                </>
                            )}

                            {/* Queried - edit and resubmit */}
                            {pr.status === 'queried' && (
                                <>
                                    <Link
                                        href={`/procurement/purchase-requests/${pr.id}/edit`}
                                        className="glass-button w-full flex items-center justify-center gap-2"
                                    >
                                        Edit & Resubmit
                                    </Link>
                                </>
                            )}

                            {/* Dept Manager actions */}
                            {pr.status === 'pending' && canApprove && (
                                <>
                                    <button onClick={() => setShowReviewModal(true)} className="glass-button w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700">
                                        <Check className="w-4 h-4" /> Approve
                                    </button>
                                    <button onClick={() => setShowQueryModal(true)} className="glass-button-secondary w-full flex items-center justify-center gap-2">
                                        <MessageSquare className="w-4 h-4" /> Query
                                    </button>
                                    <button onClick={() => setShowRejectModal(true)} className="glass-button w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700">
                                        <X className="w-4 h-4" /> Reject
                                    </button>
                                </>
                            )}

                            {/* Finance actions */}
                            {pr.status === 'dept_approved' && canFinanceReview && (
                                <>
                                    <Link
                                        href={`/procurement/purchase-requests/${pr.id}/create-po`}
                                        className="glass-button w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                                    >
                                        <Check className="w-4 h-4" /> Approve & Create PO
                                    </Link>
                                    <button onClick={() => setShowQueryModal(true)} className="glass-button-secondary w-full flex items-center justify-center gap-2">
                                        <MessageSquare className="w-4 h-4" /> Query
                                    </button>
                                    <button onClick={() => setShowHoldModal(true)} className="glass-button-secondary w-full flex items-center justify-center gap-2">
                                        <Pause className="w-4 h-4" /> Hold
                                    </button>
                                    <button onClick={() => setShowRejectModal(true)} className="glass-button w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700">
                                        <X className="w-4 h-4" /> Reject
                                    </button>
                                </>
                            )}

                            {/* PO actions: Upload Receipt */}
                            {pr.status === 'po_created' && isOrdered && canFinanceReview && (
                                <button onClick={() => setShowUploadModal(true)} className="glass-button w-full flex items-center justify-center gap-2">
                                    <Upload className="w-4 h-4" /> Upload Receipt / Invoice
                                </button>
                            )}

                            {/* PO actions: Inspect */}
                            {pr.status === 'po_created' && isPurchased && canInspect && (
                                <button onClick={openInspectModal} className="glass-button w-full flex items-center justify-center gap-2">
                                    <SearchIcon className="w-4 h-4" /> Inspect Items
                                </button>
                            )}

                            {/* PO actions: Close PO */}
                            {pr.status === 'po_created' && isInspected && canClosePo && (
                                <button onClick={handleClosePo} className="glass-button w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700">
                                    <Package className="w-4 h-4" /> Close PO & Create Stock
                                </button>
                            )}

                            {/* Cancel */}
                            {canCancel && !['cancelled', 'po_created'].includes(pr.status) && (
                                <button onClick={handleCancel} className="glass-button-secondary w-full text-red-600 hover:bg-red-50">
                                    Cancel PR
                                </button>
                            )}
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-sm p-6">
                        <h3 className="text-lg font-bold mb-4">Reject PR</h3>
                        <textarea
                            className="glass-input w-full h-24 mb-4"
                            placeholder="Reason for rejection (optional)"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setShowRejectModal(false)} className="flex-1 glass-button-secondary py-2.5">Cancel</button>
                            <button
                                onClick={() => canFinanceReview ? handleFinanceReview('reject') : handleDeptReview('reject')}
                                className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Query Modal */}
            {showQueryModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-sm p-6">
                        <h3 className="text-lg font-bold mb-4">Query PR</h3>
                        <textarea
                            className="glass-input w-full h-24 mb-4"
                            placeholder="What do you need clarified?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setShowQueryModal(false)} className="flex-1 glass-button-secondary py-2.5">Cancel</button>
                            <button
                                onClick={() => canFinanceReview ? handleFinanceReview('query') : handleDeptReview('query')}
                                className="flex-1 bg-orange-600 text-white py-2.5 rounded-lg font-medium hover:bg-orange-700"
                            >
                                Send Query
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hold Modal (Finance only) */}
            {showHoldModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-sm p-6">
                        <h3 className="text-lg font-bold mb-4">Hold PR</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Postpone Until *</label>
                                <input
                                    type="date"
                                    className="glass-input w-full"
                                    value={postponeUntil}
                                    onChange={(e) => setPostponeUntil(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Reason</label>
                                <textarea
                                    className="glass-input w-full h-24"
                                    placeholder="Why is this being held?"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => setShowHoldModal(false)} className="flex-1 glass-button-secondary py-2.5">Cancel</button>
                            <button
                                onClick={() => handleFinanceReview('hold')}
                                disabled={!postponeUntil}
                                className="flex-1 bg-purple-600 text-white py-2.5 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
                            >
                                Hold
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dept Approve Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-sm p-6">
                        <h3 className="text-lg font-bold mb-4">Approve PR</h3>
                        <textarea
                            className="glass-input w-full h-24 mb-4"
                            placeholder="Comment (optional)"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setShowReviewModal(false)} className="flex-1 glass-button-secondary py-2.5">Cancel</button>
                            <button
                                onClick={() => handleDeptReview('approve')}
                                className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700"
                            >
                                Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Receipt / Invoice Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4">Upload Receipt & Invoice</h3>
                        <form onSubmit={handleUploadReceipt}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Receipt *</label>
                                    <label className="glass-input w-full flex items-center gap-2 cursor-pointer">
                                        <Upload className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm text-slate-500">
                                            {receiptFile ? receiptFile.name : 'Select receipt file'}
                                        </span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                                            required
                                        />
                                    </label>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Invoice (optional)</label>
                                    <label className="glass-input w-full flex items-center gap-2 cursor-pointer">
                                        <Upload className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm text-slate-500">
                                            {invoiceFile ? invoiceFile.name : 'Select invoice file'}
                                        </span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
                                        />
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => { setShowUploadModal(false); setReceiptFile(null); setInvoiceFile(null); }}
                                    className="flex-1 glass-button-secondary py-2.5"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!receiptFile}
                                    className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    Upload & Mark as Purchased
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Inspection Modal */}
            {showInspectModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold mb-4">Inspect PO Items</h3>
                        <div className="space-y-4">
                            {inspectionItems.map((item: any, index: number) => (
                                <div key={item.item_id} className="glass-card p-4 rounded-lg border border-slate-200 dark:border-white/10">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="font-medium">{item.description}</p>
                                            <p className="text-xs text-slate-500">Ordered: {item.qty}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium mb-1 text-slate-500">Status *</label>
                                            <select
                                                className="glass-input w-full text-sm"
                                                value={item.inspection_status}
                                                onChange={(e) => updateInspectionItem(index, 'inspection_status', e.target.value)}
                                            >
                                                <option value="accepted">Accepted</option>
                                                <option value="rejected">Rejected</option>
                                                <option value="partial">Partial</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium mb-1 text-slate-500">Accepted Qty</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max={item.qty}
                                                step="0.01"
                                                className="glass-input w-full text-sm"
                                                value={item.accepted_qty}
                                                onChange={(e) => updateInspectionItem(index, 'accepted_qty', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium mb-1 text-slate-500">Notes</label>
                                            <input
                                                type="text"
                                                className="glass-input w-full text-sm"
                                                placeholder="Optional notes"
                                                value={item.inspection_notes}
                                                onChange={(e) => updateInspectionItem(index, 'inspection_notes', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => { setShowInspectModal(false); setInspectionItems([]); }}
                                className="flex-1 glass-button-secondary py-2.5"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleInspection}
                                className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700"
                            >
                                Save Inspection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
