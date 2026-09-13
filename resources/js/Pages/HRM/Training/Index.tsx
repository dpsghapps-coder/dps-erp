import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState } from '@/Components/ui';
import { Head, Link, usePage } from '@inertiajs/react';
import { GraduationCap, Plus, Calendar as CalendarIcon, Users } from 'lucide-react';
import { useMemo, useState, useCallback } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, startOfDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    getDay,
    locales: {} as any,
});

const navItems = ['Dashboard', 'Employees', 'Attendance', 'Leaves', 'Holidays', 'Payroll', 'Performance', 'Noticeboard', 'Training'];

interface ModuleEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    module: any;
}

export default function TrainingIndex() {
    const { modules } = usePage().props as any;
    const [currentView, setCurrentView] = useState<View>(Views.MONTH);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedModule, setSelectedModule] = useState<any>(null);

    const events: ModuleEvent[] = useMemo(() => {
        return (modules || [])
            .filter((m: any) => m.due_date)
            .map((m: any) => ({
                id: m.id,
                title: `📚 ${m.title}`,
                start: startOfDay(new Date(m.due_date)),
                end: startOfDay(new Date(m.due_date)),
                allDay: true,
                module: m,
            }));
    }, [modules]);

    const eventStyleGetter = useCallback(() => ({
        style: {
            backgroundColor: '#4f46e5',
            borderRadius: '6px',
            color: 'white',
            border: 'none',
            fontSize: '12px',
            padding: '2px 6px',
        },
    }), []);

    return (
        <AppLayout>
            <Head title="Training" />

            <div className="flex flex-wrap items-center gap-2 mb-6">
                {navItems.map((item) => (
                    <Link
                        key={item}
                        href={item === 'Training' ? '/hrm/training' : `/hrm/${item.toLowerCase()}`}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            item === 'Training'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                    >
                        {item}
                    </Link>
                ))}
            </div>

            <PageHeader
                title="Staff Training"
                subtitle={`${modules?.length || 0} training modules`}
                action={
                    <Link href="/hrm/training/create" className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Training
                    </Link>
                }
            />

            <GlassCard className="overflow-hidden p-0 mb-6">
                <div className="p-4" style={{ height: '500px' }}>
                    <BigCalendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        views={[Views.MONTH, Views.AGENDA]}
                        view={currentView}
                        date={currentDate}
                        onView={(view) => setCurrentView(view as View)}
                        onNavigate={(date) => setCurrentDate(date)}
                        eventPropGetter={eventStyleGetter}
                        onSelectEvent={(event: ModuleEvent) => setSelectedModule(event.module)}
                        popup
                    />
                </div>
            </GlassCard>

            <GlassCard className="overflow-hidden p-0">
                {(modules || []).length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                        {modules.map((module: any) => (
                            <Link
                                key={module.id}
                                href={`/hrm/training/${module.id}`}
                                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{module.title}</p>
                                        {module.category && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500">
                                                {module.category}
                                            </span>
                                        )}
                                        {!module.is_active && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                                        {module.due_date && (
                                            <span className="flex items-center gap-1">
                                                <CalendarIcon className="w-3.5 h-3.5" /> Due {new Date(module.due_date).toLocaleDateString()}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3.5 h-3.5" /> {module.completed_count}/{module.active_employee_count} completed
                                        </span>
                                    </div>
                                </div>
                                <div className="w-24 flex-shrink-0">
                                    <div className="h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500"
                                            style={{ width: `${module.active_employee_count > 0 ? (module.completed_count / module.active_employee_count) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="p-8">
                        <EmptyState icon={GraduationCap} title="No training modules yet" description="Add a training module with a video and quiz for staff to complete." />
                    </div>
                )}
            </GlassCard>

            {selectedModule && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedModule(null)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-2">{selectedModule.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Due {new Date(selectedModule.due_date).toLocaleDateString()}
                        </p>
                        <div className="flex justify-between pt-4 border-t">
                            <Link href={`/hrm/training/${selectedModule.id}`} className="glass-button-secondary px-3 py-1.5 text-sm">
                                View Details
                            </Link>
                            <button onClick={() => setSelectedModule(null)} className="glass-button-secondary px-3 py-1.5 text-sm">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
