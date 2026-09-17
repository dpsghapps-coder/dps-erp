import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Users } from 'lucide-react';

interface OnlineUser {
    id: number;
    name: string;
    avatar: string | null;
    department: string | null;
}

export default function OnlineUsersButton() {
    const [open, setOpen] = useState(false);
    const [users, setUsers] = useState<OnlineUser[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    const fetchOnlineUsers = useCallback(async () => {
        try {
            const { data } = await axios.get('/users/online');
            setUsers(data.users || []);
        } catch (error) {
            console.error('Failed to fetch online users:', error);
        }
    }, []);

    useEffect(() => {
        fetchOnlineUsers();
        const interval = setInterval(fetchOnlineUsers, 15000);
        return () => clearInterval(interval);
    }, [fetchOnlineUsers]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setOpen((o) => !o)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative"
                aria-label="Users online"
                title="Users online"
            >
                <Users className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                {users.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center bg-green-500 text-white text-[10px] font-semibold rounded-full">
                        {users.length}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-[#1a1e2a] rounded-xl border border-slate-200 dark:border-white/[0.06] shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-white/[0.06]">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Online Now</p>
                    </div>
                    <div className="max-h-80 overflow-y-auto p-2">
                        {users.length === 0 ? (
                            <p className="px-3 py-4 text-sm text-slate-400 text-center">No one else is online</p>
                        ) : (
                            users.map((u) => (
                                <div key={u.id} className="flex items-center gap-3 px-3 py-2 rounded-lg">
                                    <div className="relative flex-shrink-0">
                                        {u.avatar ? (
                                            <img src={`/storage/${u.avatar}`} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                                <span className="text-xs font-medium text-white">{u.name.charAt(0).toUpperCase()}</span>
                                            </div>
                                        )}
                                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-[#1a1e2a]" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{u.name}</p>
                                        {u.department && <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{u.department}</p>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
