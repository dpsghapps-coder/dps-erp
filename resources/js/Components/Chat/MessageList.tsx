import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { usePage } from '@inertiajs/react';
import { ArrowLeft, Paperclip, Trash2, Download, Pin, PinOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import MessageInput from './MessageInput';

interface MessageListProps {
    conversationId: number;
    onBack: () => void;
    currentUserId: number;
}

interface Message {
    id: number;
    conversation_id: number;
    user_id: number;
    content: string;
    type: 'text' | 'file' | 'system';
    is_deleted: boolean;
    is_pinned: boolean;
    pinned_at: string | null;
    read_at: string | null;
    created_at: string;
    user: {
        id: number;
        name: string;
        avatar: string | null;
    };
    attachments: Attachment[];
}

interface Attachment {
    id: number;
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
}

interface Conversation {
    id: number;
    type: 'dm' | 'group';
    name: string | null;
    participants: {
        user: {
            id: number;
            name: string;
        };
    }[];
}

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const formatTime = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
        return '';
    }
};

const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString();
    } catch {
        return '';
    }
};

const renderContent = (message: Message) => {
    if (message.is_deleted) {
        return <span className="text-slate-400 italic">{message.content}</span>;
    }

    if (message.type === 'system') {
        return <span className="text-slate-500 text-sm">{message.content}</span>;
    }

    return (
        <div className="prose prose-sm dark:prose-invert max-w-none break-words">
            <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
    );
};

interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
    isGroup: boolean;
    showDate: boolean;
    onDelete: (id: number) => void;
    onPin: (id: number) => void;
    onUnpin: (id: number) => void;
    canPin: boolean;
}

const MessageBubble = memo(function MessageBubble({ message, isOwn, isGroup, showDate, onDelete, onPin, onUnpin, canPin }: MessageBubbleProps) {
    const dateLabel = useMemo(() => formatDate(message.created_at), [message.created_at]);
    const timeLabel = useMemo(() => formatTime(message.created_at), [message.created_at]);

    return (
        <div>
            {showDate && (
                <div className="flex items-center justify-center my-4">
                    <div className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-3 py-1 rounded-full">
                        {dateLabel}
                    </div>
                </div>
            )}

            {message.is_pinned && (
                <div className="flex items-center gap-1.5 mb-1 ml-1">
                    <Pin className="w-3 h-3 text-amber-500" />
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Pinned</span>
                </div>
            )}

            <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${isOwn ? 'order-2' : ''}`}>
                    {!isOwn && isGroup && (
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 ml-1">
                            {message.user.name}
                        </p>
                    )}

                    <div
                        className={`relative group rounded-2xl px-4 py-2 ${
                            isOwn
                                ? 'bg-indigo-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                        }`}
                    >
                        {renderContent(message)}

                        {message.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                                {message.attachments.map(attachment => (
                                    <div
                                        key={attachment.id}
                                        className={`flex items-center gap-2 p-2 rounded-lg ${
                                            isOwn ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                                        }`}
                                    >
                                        <Paperclip className="w-4 h-4 flex-shrink-0" />
                                        <span className="text-sm truncate flex-1">
                                            {attachment.file_name}
                                        </span>
                                        <span className="text-xs opacity-75">
                                            {formatFileSize(attachment.file_size)}
                                        </span>
                                        <a
                                            href={`/storage/${attachment.file_path}`}
                                            download
                                            className="p-1 hover:bg-slate-200 dark:hover:bg-white/20 rounded"
                                        >
                                            <Download className="w-4 h-4" />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!message.is_deleted && (
                            <div className="absolute -top-8 right-0 hidden group-hover:flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-1">
                                {canPin && (
                                    message.is_pinned ? (
                                        <button
                                            onClick={() => onUnpin(message.id)}
                                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500"
                                            title="Unpin message"
                                        >
                                            <PinOff className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => onPin(message.id)}
                                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500"
                                            title="Pin message"
                                        >
                                            <Pin className="w-4 h-4" />
                                        </button>
                                    )
                                )}
                                {isOwn && (
                                    <button
                                        onClick={() => onDelete(message.id)}
                                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"
                                        title="Delete message"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className={`flex items-center gap-2 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            {timeLabel}
                        </span>
                        {isOwn && message.read_at && (
                            <span className="text-xs text-blue-500">Seen</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default function MessageList({ conversationId, onBack, currentUserId }: MessageListProps) {
    const { auth } = usePage().props;
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const fetchConversation = useCallback(async () => {
        try {
            const { data } = await axios.get(`/chat/conversations/${conversationId}`);
            setConversation(data);
        } catch (error) {
            console.error('Failed to fetch conversation:', error);
        }
    }, [conversationId]);

    const fetchMessages = useCallback(async (pageNum: number = 1, append: boolean = false) => {
        try {
            const { data } = await axios.get(`/chat/conversations/${conversationId}/messages`, { params: { page: pageNum } });

            if (append) {
                setMessages(prev => [...data.data, ...prev]);
            } else {
                setMessages(data.data);
            }

            setHasMore(data.current_page < data.last_page);

            if (pageNum === 1) {
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoading(false);
        }
    }, [conversationId]);

    useEffect(() => {
        fetchConversation();
        fetchMessages();
    }, [fetchConversation, fetchMessages]);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchMessages(1, false);
        }, 10000);
        return () => clearInterval(interval);
    }, [fetchMessages]);

    const handleLoadMore = () => {
        if (hasMore && !loading) {
            setPage(prev => prev + 1);
            fetchMessages(page + 1, true);
        }
    };

    const handleSendMessage = async (content: string, files?: File[]) => {
        try {
            const formData = new FormData();
            formData.append('content', content);
            if (files) {
                files.forEach(file => formData.append('files[]', file));
            }

            const { data: newMessage } = await axios.post(`/chat/conversations/${conversationId}/messages`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMessages(prev => [...prev, newMessage]);
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleDeleteMessage = async (messageId: number) => {
        if (!confirm('Are you sure you want to delete this message?')) return;

        try {
            await axios.delete(`/chat/conversations/${conversationId}/messages/${messageId}`);
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === messageId
                        ? { ...msg, content: 'This message has been deleted.', is_deleted: true }
                        : msg
                )
            );
        } catch (error) {
            console.error('Failed to delete message:', error);
        }
    };

    const handlePinMessage = async (messageId: number) => {
        try {
            await axios.post(`/chat/conversations/${conversationId}/messages/${messageId}/pin`);
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === messageId
                        ? { ...msg, is_pinned: true, pinned_at: new Date().toISOString() }
                        : msg
                )
            );
        } catch (error) {
            console.error('Failed to pin message:', error);
        }
    };

    const handleUnpinMessage = async (messageId: number) => {
        try {
            await axios.delete(`/chat/conversations/${conversationId}/messages/${messageId}/pin`);
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === messageId
                        ? { ...msg, is_pinned: false, pinned_at: null }
                        : msg
                )
            );
        } catch (error) {
            console.error('Failed to unpin message:', error);
        }
    };

    const pinnedMessages = useMemo(() => messages.filter(m => m.is_pinned), [messages]);

    const getConversationName = (): string => {
        if (!conversation) return 'Chat';
        if (conversation.type === 'group') return conversation.name || 'Group Chat';
        const other = conversation.participants.find(p => p.user.id !== currentUserId);
        return other?.user?.name || 'Unknown User';
    };

    if (loading && messages.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            </div>
        );
    }

    const canPin = (auth.user as any)?.role?.name === 'admin' || (auth.user as any)?.role?.permissions?.some((p: any) => p?.name === 'admin.manage_users');

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 p-3 border-b border-slate-200 dark:border-slate-700">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                        {getConversationName()}
                    </h3>
                    {conversation?.type === 'group' && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {conversation.participants.length} members
                        </p>
                    )}
                </div>
            </div>

            {pinnedMessages.length > 0 && (
                <div className="border-b border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30">
                    <div className="flex items-center gap-2 px-4 py-2">
                        <Pin className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                            {pinnedMessages.length} pinned message{pinnedMessages.length > 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            )}

            <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {hasMore && (
                    <button
                        onClick={handleLoadMore}
                        className="w-full text-center text-sm text-indigo-500 hover:text-indigo-600 py-2"
                    >
                        Load older messages
                    </button>
                )}

                {messages.map((message, index) => (
                    <MessageBubble
                        key={message.id}
                        message={message}
                        isOwn={message.user_id === currentUserId}
                        isGroup={conversation?.type === 'group'}
                        showDate={index === 0 || formatDate(message.created_at) !== formatDate(messages[index - 1].created_at)}
                        onDelete={handleDeleteMessage}
                        onPin={handlePinMessage}
                        onUnpin={handleUnpinMessage}
                        canPin={canPin}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            <MessageInput onSend={handleSendMessage} />
        </div>
    );
}
