import { useState, useEffect, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import { X, MessageSquare, Bell, Search, Plus, Settings } from 'lucide-react';
import ConversationList from './ConversationList';
import MessageList from './MessageList';
import ActivityTab from './ActivityTab';
import CreateConversationModal from './CreateConversationModal';

interface ChatSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    mode?: 'panel' | 'overlay';
}

type TabType = 'messages' | 'activity';

export default function ChatSidebar({ isOpen, onClose, mode = 'overlay' }: ChatSidebarProps) {
    const { auth } = usePage().props;
    const [activeTab, setActiveTab] = useState<TabType>('messages');
    const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchUnreadCounts = useCallback(async () => {
        try {
            const [messagesRes, notificationsRes] = await Promise.all([
                fetch('/chat/unread'),
                fetch('/notifications/unread-count'),
            ]);
            const messagesData = await messagesRes.json();
            const notificationsData = await notificationsRes.json();
            setUnreadMessages(messagesData.unread_count || 0);
            setUnreadNotifications(notificationsData.unread_count || 0);
        } catch (error) {
            console.error('Failed to fetch unread counts:', error);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchUnreadCounts();
            const interval = setInterval(fetchUnreadCounts, 5000);
            return () => clearInterval(interval);
        }
    }, [isOpen, fetchUnreadCounts]);

    const handleConversationSelect = (conversationId: number) => {
        setSelectedConversation(conversationId);
        fetchUnreadCounts();
    };

    const handleBackToList = () => {
        setSelectedConversation(null);
        fetchUnreadCounts();
    };

    if (!isOpen) return null;

    const headerContent = (
        <>
            <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {selectedConversation ? 'Chat' : 'Messages'}
                </h2>
            </div>
            <div className="flex items-center gap-2">
                {!selectedConversation && activeTab === 'messages' && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="New conversation"
                    >
                        <Plus className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                )}
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
            </div>
        </>
    );

    const tabsContent = !selectedConversation && (
        <div className="flex border-b border-slate-200 dark:border-slate-700">
            <button
                onClick={() => setActiveTab('messages')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors relative ${
                    activeTab === 'messages'
                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
            >
                <MessageSquare className="w-4 h-4" />
                Messages
                {unreadMessages > 0 && (
                    <span className="absolute top-2 right-4 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full px-1">
                        {unreadMessages > 99 ? '99+' : unreadMessages}
                    </span>
                )}
            </button>
            <button
                onClick={() => setActiveTab('activity')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors relative ${
                    activeTab === 'activity'
                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
            >
                <Bell className="w-4 h-4" />
                Activity
                {unreadNotifications > 0 && (
                    <span className="absolute top-2 right-4 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full px-1">
                        {unreadNotifications > 99 ? '99+' : unreadNotifications}
                    </span>
                )}
            </button>
        </div>
    );

    const contentArea = (
        <div className="flex-1 overflow-hidden">
            {selectedConversation ? (
                <MessageList
                    conversationId={selectedConversation}
                    onBack={handleBackToList}
                    currentUserId={auth.user.id}
                />
            ) : activeTab === 'messages' ? (
                <ConversationList
                    onSelect={handleConversationSelect}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    currentUserId={auth.user.id}
                />
            ) : (
                <ActivityTab currentUserId={auth.user.id} />
            )}
        </div>
    );

    const createModal = showCreateModal && (
        <CreateConversationModal
            onClose={() => setShowCreateModal(false)}
            onConversationCreated={(id) => {
                setShowCreateModal(false);
                setSelectedConversation(id);
            }}
        />
    );

    if (mode === 'panel') {
        return (
            <div className="w-full h-full flex flex-col bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    {headerContent}
                </div>
                {tabsContent}
                {contentArea}
                {createModal}
            </div>
        );
    }

    return (
        <>
            <div className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-[95] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    {headerContent}
                </div>
                {tabsContent}
                {contentArea}
            </div>
            {createModal}
        </>
    );
}
