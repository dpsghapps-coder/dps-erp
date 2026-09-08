import { useState } from 'react';
import { router } from '@inertiajs/react';
import { X, Link as LinkIcon, Copy, Check, Loader2 } from 'lucide-react';
import Modal from '@/Components/Modal';
import { copyToClipboard } from '@/Utils/clipboard';

interface InviteEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function InviteEmployeeModal({ isOpen, onClose }: InviteEmployeeModalProps) {
    const [link, setLink] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleClose = () => {
        setLink(null);
        setCopied(false);
        onClose();
    };

    const generateLink = () => {
        setGenerating(true);
        router.post('/hrm/invites', {}, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (page) => {
                setLink((page.props as any).inviteLink || null);
            },
            onFinish: () => setGenerating(false),
        });
    };

    const copyLink = async () => {
        if (!link) return;
        if (await copyToClipboard(link)) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Modal show={isOpen} onClose={handleClose}>
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Invite Employee to Self-Onboard
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {!link ? (
                    <div>
                        <p className="text-sm text-slate-500 mb-6">
                            Generate a link you can send to a new hire. They'll fill in their own
                            personal details — no login required. The link expires in 7 days and
                            can only be used once. You'll review and complete the rest (department,
                            salary, etc.) before it becomes an active employee record.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={handleClose} className="glass-button-secondary">
                                Cancel
                            </button>
                            <button
                                onClick={generateLink}
                                disabled={generating}
                                className="glass-button flex items-center gap-2"
                            >
                                {generating ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                                ) : (
                                    <><LinkIcon className="w-4 h-4" /> Generate Link</>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <p className="text-sm text-slate-500 mb-3">
                            Share this link with the new hire. It expires in 7 days.
                        </p>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                readOnly
                                value={link}
                                onFocus={(e) => e.target.select()}
                                className="glass-input w-full font-mono text-sm"
                            />
                            <button
                                onClick={copyLink}
                                className="glass-button-secondary flex items-center gap-2 shrink-0"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <button onClick={handleClose} className="glass-button">
                                Done
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
