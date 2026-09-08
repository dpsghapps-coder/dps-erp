import { useState } from 'react';
import { Plus, X } from 'lucide-react';

export interface CrewMember {
    user_id: string;
    role_in_shoot: string;
}

export default function CrewPicker({ users, crew, onChange }: {
    users: { id: number; name: string }[];
    crew: CrewMember[];
    onChange: (crew: CrewMember[]) => void;
}) {
    const [userId, setUserId] = useState('');
    const [role, setRole] = useState('');

    const availableUsers = users.filter((u) => !crew.some((c) => c.user_id === String(u.id)));

    const add = () => {
        if (!userId || !role.trim()) return;
        onChange([...crew, { user_id: userId, role_in_shoot: role.trim() }]);
        setUserId('');
        setRole('');
    };

    const remove = (index: number) => {
        onChange(crew.filter((_, i) => i !== index));
    };

    return (
        <div>
            {crew.length > 0 && (
                <div className="space-y-2 mb-4">
                    {crew.map((member, i) => {
                        const user = users.find((u) => String(u.id) === member.user_id);
                        return (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-lg">
                                <div>
                                    <p className="font-medium text-sm">{user?.name || 'Unknown'}</p>
                                    <p className="text-xs text-slate-400">{member.role_in_shoot}</p>
                                </div>
                                <button type="button" onClick={() => remove(i)} className="text-slate-400 hover:text-red-500">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
            <div className="space-y-2">
                <select value={userId} onChange={(e) => setUserId(e.target.value)} className="glass-input w-full">
                    <option value="">Select crew member</option>
                    {availableUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
                        placeholder="Role (e.g. Photographer)"
                        className="glass-input flex-1"
                    />
                    <button type="button" onClick={add} disabled={!userId || !role.trim()} className="glass-button-secondary px-3 disabled:opacity-50">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
