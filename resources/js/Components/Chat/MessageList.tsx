import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Send, Paperclip, Trash2, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import sanitizeHtml from 'sanitize-html';
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

export default function MessageList({ conversationId, onBack, currentUserId }: MessageListProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const fetchConversation = useCallback(async () => {
        try {
            const response = await fetch('/chat/conversations');
            const data = await response.json();
            const conv = data.find((c: Conversation) => c.id === conversationId);
            setConversation(conv || null);
        } catch (error) {
            console.error('Failed to fetch conversation:', error);
        }
    }, [conversationId]);

    const fetchMessages = useCallback(async (pageNum: number = 1, append: boolean = false) => {
        try {
            const response = await fetch(`/chat/conversations/${conversationId}/messages?page=${pageNum}`);
            const data = await response.json();

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
        }, 5000);
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

            const response = await fetch(`/chat/conversations/${conversationId}/messages`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const newMessage = await response.json();
                setMessages(prev => [...prev, newMessage]);
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleDeleteMessage = async (messageId: number) => {
        if (!confirm('Are you sure you want to delete this message?')) return;

        try {
            const response = await fetch(`/chat/conversations/${conversationId}/messages/${messageId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === messageId
                            ? { ...msg, content: 'This message has been deleted.', is_deleted: true }
                            : msg
                    )
                );
            }
        } catch (error) {
            console.error('Failed to delete message:', error);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getConversationName = (): string => {
        if (!conversation) return 'Chat';
        if (conversation.type === 'group') return conversation.name || 'Group Chat';
        const other = conversation.participants.find(p => p.user.id !== currentUserId);
        return other?.user?.name || 'Unknown User';
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
            <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none break-words">
                {message.content}
            </ReactMarkdown>
        );
    };

    if (loading && messages.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
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

            {/* Messages */}
            <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {hasMore && (
                    <button
                        onClick={handleLoadMore}
                        className="w-full text-center text-sm text-indigo-500 hover:text-indigo-600 py-2"
                    >
                        Load older messages
                    </button>
                )}

                {messages.map((message, index) => {
                    const isOwn = message.user_id === currentUserId;
                    const showDate = index === 0 ||
                        formatDate(message.created_at) !== formatDate(messages[index - 1].created_at);

                    return (
                        <div key={message.id}>
                            {showDate && (
                                <div className="flex items-center justify-center my-4">
                                    <div className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-3 py-1 rounded-full">
                                        {formatDate(message.created_at)}
                                    </div>
                                </div>
                            )}

                            <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] ${isOwn ? 'order-2' : ''}`}>
                                    {!isOwn && conversation?.type === 'group' && (
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
                                                            className="p-1 hover:bg-white/20 rounded"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        {isOwn && !message.is_deleted && (
                                            <div className="absolute -top-8 right-0 hidden group-hover:flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-1">
                                                <button
                                                    onClick={() => handleDeleteMessage(message.id)}
                                                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"
                                                    title="Delete message"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className={`flex items-center gap-2 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            {formatTime(message.created_at)}
                                        </span>
                                        {isOwn && message.read_at && (
                                            <span className="text-xs text-blue-500">Seen</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <MessageInput onSend={handleSendMessage} />
        </div>
    );
}
