import { useState, useEffect, useCallback } from 'react';
import { Bell, Settings, Check, CheckCheck, Package, ShoppingCart, Box, Users, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityTabProps {
    currentUserId: number;
}

interface Notification {
    id: string;
    type: string;
    data: {
        module: string;
        action: string;
        message: string;
        url: string;
        pr_number?: string;
        order_number?: string;
        item_name?: string;
        employee_name?: string;
    };
    read_at: string | null;
    created_at: string;
}

interface Preferences {
    procurement: boolean;
    orders: boolean;
    inventory: boolean;
    hrm: boolean;
    chat_messages: boolean;
}

export default function ActivityTab({ currentUserId }: ActivityTabProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [preferences, setPreferences] = useState<Preferences>({
        procurement: true,
        orders: true,
        inventory: true,
        hrm: true,
        chat_messages: true,
    });
    const [showPreferences, setShowPreferences] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await fetch('/notifications');
            const data = await response.json();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPreferences = useCallback(async () => {
        try {
            const response = await fetch('/notifications/preferences');
            const data = await response.json();
            setPreferences(data);
        } catch (error) {
            console.error('Failed to fetch preferences:', error);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        fetchPreferences();
    }, [fetchNotifications, fetchPreferences]);

    useEffect(() => {
        const interval = setInterval(fetchNotifications, 5000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await fetch(`/notifications/${notificationId}/read`, { method: 'POST' });
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n)
            );
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await fetch('/notifications/read-all', { method: 'POST' });
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handlePreferenceChange = async (key: keyof Preferences, value: boolean) => {
        try {
            await fetch('/notifications/preferences', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [key]: value }),
            });
            setPreferences(prev => ({ ...prev, [key]: value }));
        } catch (error) {
            console.error('Failed to update preference:', error);
        }
    };

    const getModuleIcon = (module: string) => {
        switch (module) {
            case 'procurement': return <Package className="w-5 h-5 text-blue-500" />;
            case 'orders': return <ShoppingCart className="w-5 h-5 text-green-500" />;
            case 'inventory': return <Box className="w-5 h-5 text-orange-500" />;
            case 'hrm': return <Users className="w-5 h-5 text-purple-500" />;
            default: return <Bell className="w-5 h-5 text-slate-500" />;
        }
    };

    const formatTime = (dateString: string): string => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch {
            return '';
        }
    };

    const unreadCount = notifications.filter(n => !n.read_at).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-600"
                        >
                            <CheckCheck className="w-4 h-4" />
                            Mark all read
                        </button>
                    )}
                    <button
                        onClick={() => setShowPreferences(!showPreferences)}
                        className={`p-2 rounded-lg transition-colors ${
                            showPreferences
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'
                        }`}
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Preferences Panel */}
            {showPreferences && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                        NOTIFICATION TYPES
                    </h4>
                    <div className="space-y-2">
                        {Object.entries(preferences).map(([key, value]) => (
                            <label key={key} className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">
                                    {key.replace('_', ' ')}
                                </span>
                                <button
                                    onClick={() => handlePreferenceChange(key as keyof Preferences, !value)}
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                        value ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                            value ? 'translate-x-4.5' : 'translate-x-0.5'
                                        }`}
                                    />
                                </button>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
                        <Bell className="w-12 h-12 mb-3 opacity-50" />
                        <p className="text-sm">No notifications yet</p>
                        <p className="text-xs mt-1">Activity will appear here</p>
                    </div>
                ) : (
                    notifications.map(notification => (
                        <div
                            key={notification.id}
                            onClick={() => {
                                handleMarkAsRead(notification.id);
                                if (notification.data.url) {
                                    window.location.href = notification.data.url;
                                }
                            }}
                            className={`flex items-start gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer border-b border-slate-100 dark:border-slate-800 ${
                                !notification.read_at ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''
                            }`}
                        >
                            <div className="flex-shrink-0 mt-0.5">
                                {getModuleIcon(notification.data.module)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm ${!notification.read_at ? 'font-medium text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {notification.data.message}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        {formatTime(notification.created_at)}
                                    </span>
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                                        {notification.data.module}
                                    </span>
                                </div>
                            </div>
                            {!notification.read_at && (
                                <div className="flex-shrink-0">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
