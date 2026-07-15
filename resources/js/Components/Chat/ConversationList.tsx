import { useState, useEffect, useCallback } from 'react';
import { Search, Users, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
    id: number;
    type: 'dm' | 'group';
    name: string | null;
    created_by: number;
    participants: Participant[];
    latest_message: Message | null;
    unread_count: number;
}

interface Participant {
    id: number;
    user_id: number;
    role: string;
    user: {
        id: number;
        name: string;
        avatar: string | null;
    };
}

interface Message {
    id: number;
    content: string;
    created_at: string;
    user: {
        id: number;
        name: string;
    };
}

interface ConversationListProps {
    onSelect: (conversationId: number) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    currentUserId: number;
}

export default function ConversationList({ onSelect, searchQuery, onSearchChange, currentUserId }: ConversationListProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchConversations = useCallback(async () => {
        try {
            const response = await fetch('/chat/conversations');
            const data = await response.json();
            setConversations(data);
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 5000);
        return () => clearInterval(interval);
    }, [fetchConversations]);

    const filteredConversations = conversations.filter(conv => {
        if (!searchQuery) return true;
        const displayName = getDisplayName(conv, currentUserId);
        return displayName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const getDisplayName = (conv: Conversation, userId: number): string => {
        if (conv.type === 'group') return conv.name || 'Group Chat';
        const otherParticipant = conv.participants.find(p => p.user_id !== userId);
        return otherParticipant?.user?.name || 'Unknown User';
    };

    const getAvatar = (conv: Conversation, userId: number): string | null => {
        if (conv.type === 'group') return null;
        const otherParticipant = conv.participants.find(p => p.user_id !== userId);
        return otherParticipant?.user?.avatar || null;
    };

    const getInitials = (conv: Conversation, userId: number): string => {
        const name = getDisplayName(conv, userId);
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatTime = (dateString: string | null): string => {
        if (!dateString) return '';
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch {
            return '';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Search */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 border-0 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-500"
                    />
                </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
                        <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
                        <p className="text-sm">No conversations yet</p>
                        <p className="text-xs mt-1">Start a new conversation</p>
                    </div>
                ) : (
                    filteredConversations.map(conv => (
                        <button
                            key={conv.id}
                            onClick={() => onSelect(conv.id)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800"
                        >
                            {/* Avatar */}
                            <div className="relative">
                                {conv.type === 'group' ? (
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                ) : getAvatar(conv, currentUserId) ? (
                                    <img
                                        src={getAvatar(conv, currentUserId)!}
                                        alt=""
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                        <span className="text-lg font-medium text-white">
                                            {getInitials(conv, currentUserId)}
                                        </span>
                                    </div>
                                )}
                                {conv.unread_count > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center text-[11px] font-bold text-white bg-red-500 rounded-full px-1">
                                        {conv.unread_count > 99 ? '99+' : conv.unread_count}
                                    </span>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 text-left">
                                <div className="flex items-center justify-between">
                                    <h3 className={`text-sm truncate ${conv.unread_count > 0 ? 'font-semibold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                                        {getDisplayName(conv, currentUserId)}
                                    </h3>
                                    {conv.latest_message && (
                                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                                            {formatTime(conv.latest_message.created_at)}
                                        </span>
                                    )}
                                </div>
                                {conv.latest_message && (
                                    <p className={`text-sm truncate mt-0.5 ${conv.unread_count > 0 ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {conv.latest_message.user.id === currentUserId ? 'You: ' : ''}
                                        {conv.latest_message.content}
                                    </p>
                                )}
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}

function MessageSquare(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    );
}
