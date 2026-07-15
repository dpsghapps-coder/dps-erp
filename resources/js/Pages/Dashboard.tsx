import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge, EmptyState } from '@/Components/ui';
import { Head, usePage, Link } from '@inertiajs/react';
import { Users, ShoppingCart, Factory, Camera, Package, UserCog, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

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

export default function Dashboard() {
    const { stats, recent_orders, recent_jobs } = usePage().props as any;

    const statCards = [
        { label: 'Total Clients', value: stats?.total_clients || 0, icon: Users, color: 'text-blue-400', href: '/crm' },
        { label: 'Active Clients', value: stats?.active_clients || 0, icon: Users, color: 'text-green-400', href: '/crm' },
        { label: 'Total Orders', value: stats?.total_orders || 0, icon: ShoppingCart, color: 'text-purple-400', href: '/orders' },
        { label: 'Pending Orders', value: stats?.pending_orders || 0, icon: ShoppingCart, color: 'text-yellow-400', href: '/orders' },
        { label: 'Active Jobs', value: stats?.production_jobs || 0, icon: Factory, color: 'text-orange-400', href: '/production' },
        { label: 'Bookings', value: stats?.studio_bookings || 0, icon: Camera, color: 'text-cyan-400', href: '/studio' },
        { label: 'Products', value: stats?.total_products || 0, icon: Package, color: 'text-pink-400', href: '/products' },
        { label: 'Employees', value: stats?.total_employees || 0, icon: UserCog, color: 'text-indigo-400', href: '/hrm' },
    ];

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
            >
                <PageHeader title="Dashboard" subtitle="Welcome back!" />
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-4 mb-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {statCards.map((stat, i) => (
                    <motion.div key={i} variants={itemVariants}>
                        <Link key={i} href={stat.href}>
                            <GlassCard variant="interactive" className="h-full">
                                <div className="flex items-center gap-3">
                                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                                    <div>
                                        <p className="text-2xl font-semibold">{stat.value}</p>
                                        <p className="text-sm text-slate-400">{stat.label}</p>
                                    </div>
                                </div>
                            </GlassCard>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>

            {/* Quick Actions & Overview */}
            <motion.div 
                className="grid lg:grid-cols-3 gap-6 mb-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Recent Orders */}
                <motion.div variants={itemVariants}>
                    <GlassCard>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Recent Orders</h2>
                            <Link href="/orders" className="text-sm text-blue-400 hover:underline flex items-center gap-1">
                                View All <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        {recent_orders?.length > 0 ? (
                            <div className="space-y-3">
                                {recent_orders.slice(0, 4).map((order: any) => (
                                    <div key={order.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                        <div>
                                            <p className="font-medium">{order.order_number}</p>
                                            <p className="text-sm text-slate-400">{order.client?.company_name}</p>
                                        </div>
                                        <div className="text-right">
                                            <StatusBadge status={order.status} />
                                            <p className="text-sm mt-1">${order.grand_total}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState icon={ShoppingCart} title="No orders yet" />
                        )}
                    </GlassCard>
                </motion.div>

                {/* Production Jobs */}
                <motion.div variants={itemVariants}>
                    <GlassCard>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Production Jobs</h2>
                            <Link href="/production" className="text-sm text-blue-400 hover:underline flex items-center gap-1">
                                View All <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        {recent_jobs?.length > 0 ? (
                            <div className="space-y-3">
                                {recent_jobs.slice(0, 4).map((job: any) => (
                                    <div key={job.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                        <div>
                                            <p className="font-medium">{job.job_number}</p>
                                            <p className="text-sm text-slate-400">{job.title}</p>
                                        </div>
                                        <div className="text-right">
                                            <StatusBadge status={job.status} />
                                            <p className="text-sm mt-1 text-slate-400">{job.priority}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState icon={Factory} title="No jobs yet" />
                        )}
                    </GlassCard>
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={itemVariants}>
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <Link href="/crm/create" className="glass-button-secondary text-center text-sm">New Client</Link>
                            <Link href="/orders/create" className="glass-button-secondary text-center text-sm">New Order</Link>
                            <Link href="/production/create" className="glass-button-secondary text-center text-sm">New Job</Link>
                            <Link href="/studio/create" className="glass-button-secondary text-center text-sm">Book Studio</Link>
                            <Link href="/hrm/create" className="glass-button-secondary text-center text-sm">Add Employee</Link>
                            <Link href="/products/create" className="glass-button-secondary text-center text-sm">Add Product</Link>
                        </div>
                    </GlassCard>
                </motion.div>
            </motion.div>
        </AppLayout>
    );
}