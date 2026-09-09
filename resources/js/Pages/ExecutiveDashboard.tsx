import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, usePage } from '@inertiajs/react';
import { TrendingUp, Users, ShoppingCart, DollarSign, Factory, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCurrency } from '@/Utils/currency';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

export default function ExecutiveDashboard() {
    const { stats } = usePage().props as any;
    const formatCurrency = useCurrency();

    const executiveMetrics = [
        {
            label: 'Total Revenue',
            value: formatCurrency(stats?.total_revenue || 0),
            icon: DollarSign,
            color: 'text-green-400',
            trend: '+12.5%'
        },
        {
            label: 'Active Clients',
            value: stats?.active_clients || 0,
            icon: Users,
            color: 'text-blue-400',
            trend: '+8.2%'
        },
        {
            label: 'Orders in Progress',
            value: stats?.pending_orders || 0,
            icon: ShoppingCart,
            color: 'text-purple-400',
            trend: '-2.1%'
        },
        {
            label: 'Production Jobs',
            value: stats?.production_jobs || 0,
            icon: Factory,
            color: 'text-orange-400',
            trend: '+5.3%'
        },
    ];

    return (
        <AppLayout>
            <Head title="Executive Dashboard" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
            >
                <PageHeader
                    title="Executive Dashboard"
                    subtitle="High-level business metrics and performance overview"
                />
            </motion.div>

            {/* Executive Metrics */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {executiveMetrics.map((metric, i) => (
                    <motion.div key={i} variants={itemVariants}>
                        <GlassCard className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <metric.icon className={`w-8 h-8 ${metric.color}`} />
                                <div className="flex items-center gap-1 text-sm text-green-400">
                                    <TrendingUp className="w-4 h-4" />
                                    <span>{metric.trend}</span>
                                </div>
                            </div>
                            <p className="text-3xl font-bold mb-1">{metric.value}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{metric.label}</p>
                        </GlassCard>
                    </motion.div>
                ))}
            </motion.div>

            {/* Key Insights */}
            <motion.div
                className="grid lg:grid-cols-2 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants}>
                    <GlassCard>
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="w-5 h-5 text-blue-400" />
                            <h2 className="text-lg font-semibold">Business Summary</h2>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-white/5 rounded-lg">
                                <span className="text-slate-600 dark:text-slate-400">Total Clients</span>
                                <span className="font-semibold">{stats?.total_clients || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-white/5 rounded-lg">
                                <span className="text-slate-600 dark:text-slate-400">Total Products</span>
                                <span className="font-semibold">{stats?.total_products || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-white/5 rounded-lg">
                                <span className="text-slate-600 dark:text-slate-400">Total Employees</span>
                                <span className="font-semibold">{stats?.total_employees || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-white/5 rounded-lg">
                                <span className="text-slate-600 dark:text-slate-400">Studio Bookings</span>
                                <span className="font-semibold">{stats?.studio_bookings || 0}</span>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4">Performance Notes</h2>
                        <div className="space-y-4">
                            <div className="p-3 bg-green-50 dark:bg-green-500/10 rounded-lg border border-green-200 dark:border-green-500/20">
                                <p className="text-sm font-medium text-green-700 dark:text-green-400">Strong Performance</p>
                                <p className="text-xs text-green-600 dark:text-green-300 mt-1">Revenue targets on track with consistent client growth</p>
                            </div>
                            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
                                <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Operations Optimized</p>
                                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">Production jobs and order fulfillment running efficiently</p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </motion.div>
        </AppLayout>
    );
}
