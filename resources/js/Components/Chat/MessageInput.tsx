import { useState, useRef } from 'react';
import { Send, Paperclip, X, Bold, Italic, Code, Link } from 'lucide-react';

interface MessageInputProps {
    onSend: (content: string, files?: File[]) => void;
    disabled?: boolean;
}

export default function MessageInput({ onSend, disabled = false }: MessageInputProps) {
    const [content, setContent] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [showFormatting, setShowFormatting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if ((!content.trim() && files.length === 0) || disabled) return;

        onSend(content.trim(), files.length > 0 ? files : undefined);
        setContent('');
        setFiles([]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        const validFiles = selectedFiles.filter(file => {
            if (file.size > 10 * 1024 * 1024) {
                alert(`${file.name} exceeds 10MB limit`);
                return false;
            }
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
            if (!allowedTypes.includes(file.type)) {
                alert(`${file.name} is not an allowed file type`);
                return false;
            }
            return true;
        });

        setFiles(prev => [...prev, ...validFiles].slice(0, 5));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const insertFormatting = (prefix: string, suffix: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        const newText = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);

        setContent(newText);
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, end + prefix.length);
        }, 0);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="border-t border-slate-200 dark:border-slate-700 p-3">
            {/* Formatting toolbar */}
            {showFormatting && (
                <div className="flex items-center gap-1 mb-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                    <button
                        type="button"
                        onClick={() => insertFormatting('**', '**')}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400"
                        title="Bold"
                    >
                        <Bold className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => insertFormatting('*', '*')}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400"
                        title="Italic"
                    >
                        <Italic className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => insertFormatting('`', '`')}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400"
                        title="Code"
                    >
                        <Code className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => insertFormatting('[', '](url)')}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400"
                        title="Link"
                    >
                        <Link className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* File attachments preview */}
            {files.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {files.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 text-sm"
                        >
                            <Paperclip className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                                {file.name}
                            </span>
                            <span className="text-slate-500 text-xs">
                                {formatFileSize(file.size)}
                            </span>
                            <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                            >
                                <X className="w-3 h-3 text-slate-500" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Input area */}
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message... (Shift+Enter for new line)"
                        disabled={disabled}
                        rows={1}
                        className="w-full px-4 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 border-0 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-500 disabled:opacity-50"
                        style={{ minHeight: '42px', maxHeight: '120px' }}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                        }}
                    />
                </div>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => setShowFormatting(!showFormatting)}
                        className={`p-2.5 rounded-xl transition-colors ${
                            showFormatting
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'
                        }`}
                        title="Formatting"
                    >
                        <span className="font-bold text-sm">Aa</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors"
                        title="Attach file"
                    >
                        <Paperclip className="w-5 h-5" />
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    <button
                        type="submit"
                        disabled={(!content.trim() && files.length === 0) || disabled}
                        className="p-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 rounded-xl text-white transition-colors disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
}
