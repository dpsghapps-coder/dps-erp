import { useState, useEffect } from 'react';
import { X, Search, Users, User } from 'lucide-react';

interface CreateConversationModalProps {
    onClose: () => void;
    onConversationCreated: (id: number) => void;
}

interface User {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    department: string | null;
}

export default function CreateConversationModal({ onClose, onConversationCreated }: CreateConversationModalProps) {
    const [type, setType] = useState<'dm' | 'group'>('dm');
    const [name, setName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (searchQuery.length >= 2) {
            fetchUsers();
        } else {
            setUsers([]);
        }
    }, [searchQuery]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/search?q=${encodeURIComponent(searchQuery)}&type=users`);
            const data = await response.json();
            setUsers(data.users || data || []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleUser = (user: User) => {
        if (type === 'dm' && selectedUsers.length === 1) {
            setSelectedUsers([user]);
        } else {
            setSelectedUsers(prev => {
                const exists = prev.find(u => u.id === user.id);
                if (exists) {
                    return prev.filter(u => u.id !== user.id);
                }
                return [...prev, user];
            });
        }
    };

    const handleCreate = async () => {
        if (selectedUsers.length === 0) return;

        setCreating(true);
        try {
            const response = await fetch('/chat/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    name: type === 'group' ? name : undefined,
                    participant_ids: selectedUsers.map(u => u.id),
                }),
            });

            if (response.ok) {
                const conversation = await response.json();
                onConversationCreated(conversation.id);
            }
        } catch (error) {
            console.error('Failed to create conversation:', error);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        New Conversation
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Type Selection */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => { setType('dm'); setSelectedUsers([]); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
                                type === 'dm'
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            <User className="w-4 h-4" />
                            Direct Message
                        </button>
                        <button
                            onClick={() => setType('group')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
                                type === 'group'
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            <Users className="w-4 h-4" />
                            Group Chat
                        </button>
                    </div>

                    {/* Group Name */}
                    {type === 'group' && (
                        <input
                            type="text"
                            placeholder="Group name (required)"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-500"
                        />
                    )}

                    {/* Search Users */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-500"
                        />
                    </div>

                    {/* Selected Users */}
                    {selectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selectedUsers.map(user => (
                                <div
                                    key={user.id}
                                    className="flex items-center gap-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm"
                                >
                                    <span>{user.name}</span>
                                    <button
                                        onClick={() => toggleUser(user)}
                                        className="p-0.5 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Users List */}
                    <div className="max-h-60 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                <p className="text-sm">
                                    {searchQuery.length < 2 ? 'Type at least 2 characters to search' : 'No users found'}
                                </p>
                            </div>
                        ) : (
                            users.map(user => {
                                const isSelected = selectedUsers.some(u => u.id === user.id);
                                return (
                                    <button
                                        key={user.id}
                                        onClick={() => toggleUser(user)}
                                        className={`w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-xl ${
                                            isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                                        }`}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                            <span className="text-sm font-medium text-white">
                                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                            </span>
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                {user.name}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {user.department || user.email}
                                            </p>
                                        </div>
                                        {isSelected && (
                                            <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={selectedUsers.length === 0 || creating || (type === 'group' && !name.trim())}
                        className="px-4 py-2 text-sm font-medium bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl transition-colors disabled:cursor-not-allowed"
                    >
                        {creating ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    );
}
