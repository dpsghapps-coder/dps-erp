import { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState } from '@/Components/ui';
import { Search, Network } from 'lucide-react';

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    avatar: string | null;
    job_title: string | null;
    department_id: number | null;
    staff_level_id: number | null;
    supervising_manager_id: number | null;
    department?: { id: number; name: string } | null;
    staff_level?: { id: number; name: string } | null;
}

interface TreeNode extends Employee {
    children: TreeNode[];
}

function buildForest(employees: Employee[]): TreeNode[] {
    const byId = new Map<number, TreeNode>();
    employees.forEach((e) => byId.set(e.id, { ...e, children: [] }));

    const roots: TreeNode[] = [];

    byId.forEach((node) => {
        const managerId = node.supervising_manager_id;
        const manager = managerId != null ? byId.get(managerId) : undefined;

        if (manager && manager.id !== node.id) {
            manager.children.push(node);
        } else {
            // No manager on record, or the manager isn't an active employee
            // (e.g. terminated) -- treat as a root of its own tree.
            roots.push(node);
        }
    });

    const sortByName = (a: TreeNode, b: TreeNode) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
    const sortRecursively = (nodes: TreeNode[]) => {
        nodes.sort(sortByName);
        nodes.forEach((n) => sortRecursively(n.children));
    };
    sortRecursively(roots);

    return roots;
}

function initials(first: string, last: string): string {
    return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();
}

function NodeCard({ node, highlighted }: { node: TreeNode; highlighted: boolean }) {
    return (
        <Link
            href={`/hrm/employees/${node.id}`}
            className={`org-node-card ${highlighted ? 'org-node-highlighted' : ''}`}
        >
            <div className="org-node-avatar">
                {node.avatar ? (
                    <img src={`/storage/${node.avatar}`} alt={`${node.first_name} ${node.last_name}`} />
                ) : (
                    <span>{initials(node.first_name, node.last_name)}</span>
                )}
            </div>
            <div className="org-node-name">{node.first_name} {node.last_name}</div>
            {node.job_title && <div className="org-node-title">{node.job_title}</div>}
            {node.department?.name && <div className="org-node-dept">{node.department.name}</div>}
        </Link>
    );
}

function TreeBranch({ node, highlightId }: { node: TreeNode; highlightId: number | null }) {
    return (
        <li>
            <NodeCard node={node} highlighted={node.id === highlightId} />
            {node.children.length > 0 && (
                <ul>
                    {node.children.map((child) => (
                        <TreeBranch key={child.id} node={child} highlightId={highlightId} />
                    ))}
                </ul>
            )}
        </li>
    );
}

export default function OrgChart({ employees }: { employees: Employee[] }) {
    const [search, setSearch] = useState('');
    const forest = useMemo(() => buildForest(employees), [employees]);

    const highlightId = useMemo(() => {
        if (!search.trim()) return null;
        const term = search.trim().toLowerCase();
        const match = employees.find((e) => `${e.first_name} ${e.last_name}`.toLowerCase().includes(term));
        return match?.id ?? null;
    }, [search, employees]);

    return (
        <AppLayout>
            <Head title="Organization Chart" />

            <style>{`
                .org-chart-scroll { overflow-x: auto; padding: 8px 4px 32px; }
                .org-chart-forest { display: flex; gap: 48px; justify-content: center; min-width: max-content; }
                .org-chart-tree, .org-chart-tree ul { list-style: none; margin: 0; padding: 0; }
                .org-chart-tree { display: flex; text-align: center; }
                .org-chart-tree ul { display: flex; padding-top: 28px; position: relative; }
                .org-chart-tree li { position: relative; padding: 28px 10px 0 10px; display: flex; flex-direction: column; align-items: center; }
                .org-chart-tree li::before, .org-chart-tree li::after {
                    content: ''; position: absolute; top: 0; right: 50%;
                    border-top: 2px solid var(--org-line, #cbd5e1); width: 50%; height: 28px;
                }
                .org-chart-tree li::after { right: auto; left: 50%; border-left: 2px solid var(--org-line, #cbd5e1); }
                .org-chart-tree li:only-child::before, .org-chart-tree li:only-child::after { display: none; }
                .org-chart-tree li:only-child { padding-top: 0; }
                .org-chart-tree li:first-child::before, .org-chart-tree li:last-child::after { border: 0 none; }
                .org-chart-tree li:last-child::before { border-right: 2px solid var(--org-line, #cbd5e1); border-radius: 0 6px 0 0; }
                .org-chart-tree li:first-child::after { border-radius: 6px 0 0 0; }
                .org-chart-tree ul ul::before {
                    content: ''; position: absolute; top: 0; left: 50%;
                    border-left: 2px solid var(--org-line, #cbd5e1); width: 0; height: 28px;
                }
                :root:not([data-theme="light"]) .org-chart-tree { --org-line: #cbd5e1; }
                @media (prefers-color-scheme: dark) {
                    :root:not([data-theme="light"]) .org-chart-tree { --org-line: #475569; }
                }
                :root[data-theme="dark"] .org-chart-tree { --org-line: #475569; }

                .org-node-card {
                    display: flex; flex-direction: column; align-items: center; gap: 2px;
                    width: 140px; padding: 12px 10px; border-radius: 12px;
                    background: var(--org-card-bg, #fff); border: 1px solid var(--org-card-border, #e2e8f0);
                    text-decoration: none; transition: box-shadow .15s, border-color .15s;
                }
                .org-node-card:hover { box-shadow: 0 4px 14px rgba(0,0,0,0.08); border-color: #818cf8; }
                .org-node-highlighted { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.25); }
                :root:not([data-theme="light"]) .org-node-card { --org-card-bg: #fff; --org-card-border: #e2e8f0; }
                @media (prefers-color-scheme: dark) {
                    :root:not([data-theme="light"]) .org-node-card { --org-card-bg: #1e293b; --org-card-border: rgba(255,255,255,0.1); }
                }
                :root[data-theme="dark"] .org-node-card { --org-card-bg: #1e293b; --org-card-border: rgba(255,255,255,0.1); }

                .org-node-avatar {
                    width: 48px; height: 48px; border-radius: 9999px; overflow: hidden;
                    background: #eef2ff; color: #4338ca; display: flex; align-items: center; justify-content: center;
                    font-weight: 600; font-size: 14px; flex-shrink: 0;
                }
                .org-node-avatar img { width: 100%; height: 100%; object-fit: cover; }
                .org-node-name { font-size: 13px; font-weight: 600; color: var(--org-text, #0f172a); line-height: 1.2; }
                .org-node-title { font-size: 11px; color: #94a3b8; line-height: 1.2; }
                .org-node-dept { font-size: 11px; color: #6366f1; line-height: 1.2; }
                :root:not([data-theme="light"]) .org-node-name { --org-text: #0f172a; }
                @media (prefers-color-scheme: dark) {
                    :root:not([data-theme="light"]) .org-node-name { --org-text: #f1f5f9; }
                }
                :root[data-theme="dark"] .org-node-name { --org-text: #f1f5f9; }
            `}</style>

            <PageHeader
                title="Organization Chart"
                subtitle="Reporting structure across the company, based on each employee's supervising manager"
            />

            <GlassCard className="mb-6">
                <div className="relative max-w-sm">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        className="glass-input w-full pl-9"
                        placeholder="Find an employee..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </GlassCard>

            {forest.length === 0 ? (
                <EmptyState
                    icon={Network}
                    title="No employees to chart"
                    description="Once employees are added and linked to a supervising manager, the reporting structure will appear here."
                />
            ) : (
                <GlassCard>
                    <div className="org-chart-scroll">
                        <div className="org-chart-forest">
                            {forest.map((root) => (
                                <ul className="org-chart-tree" key={root.id}>
                                    <TreeBranch node={root} highlightId={highlightId} />
                                </ul>
                            ))}
                        </div>
                    </div>
                </GlassCard>
            )}
        </AppLayout>
    );
}
