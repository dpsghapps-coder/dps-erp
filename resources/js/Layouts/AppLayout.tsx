import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { 
    LayoutDashboard, 
    Users, 
    Package, 
    ShoppingCart, 
    Factory, 
    ShoppingBag, 
    UserCog, 
    Camera, 
    Settings,
    Search,
    Bell,
    Menu,
    X,
    ChevronLeft,
    ChevronDown,
    LogOut,
    BarChart3,
    UserPlus,
    Boxes,
    Truck,
    ClipboardList,
    DollarSign,
    Wrench,
    Clock,
    Calendar,
    CalendarDays,
    DollarSignIcon,
    TrendingUp,
    BellIcon,
    UsersIcon,
    Plus,
    ClipboardCheck
} from 'lucide-react';
import ChatSidebar from '@/Components/Chat/ChatSidebar';

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface CrmSubItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

const enterpriseNav: NavItem[] = [
    { name: 'CRM', href: '/crm', icon: Users },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Production', href: '/production', icon: Factory },
    { name: 'Procurement', href: '/procurement', icon: ShoppingBag },
];

const crmSubItems: CrmSubItem[] = [
    { name: 'Client Management', href: '/crm', icon: Users },
    { name: 'Lead Management', href: '/crm/leads', icon: UserPlus },
    { name: 'Reports', href: '/crm/reports', icon: BarChart3 },
];

const inventorySubItems: CrmSubItem[] = [
    { name: 'Overview', href: '/inventory', icon: LayoutDashboard },
    { name: 'Suppliers', href: '/inventory/suppliers', icon: Truck },
    { name: 'Materials', href: '/inventory/materials', icon: Package },
    { name: 'Stock', href: '/inventory/stock', icon: Boxes },
    { name: 'Requisition', href: '/inventory/requisitions', icon: ClipboardList },
];

const productsSubItemsFull: CrmSubItem[] = [
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Services', href: '/services', icon: Wrench },
];

const ordersSubItems: CrmSubItem[] = [
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Create Order', href: '/orders/create', icon: Plus },
    { name: 'Order Reports', href: '/orders/reports', icon: BarChart3 },
];

const productionSubItems: CrmSubItem[] = [
    { name: 'Production', href: '/production', icon: Factory },
    { name: 'Production Reports', href: '/production/reports', icon: BarChart3 },
];

const managementNav: NavItem[] = [
    { name: 'HRM', href: '/hrm', icon: UserCog },
    { name: 'Finance', href: '/finance', icon: DollarSign },
];
const hrmSubItems: CrmSubItem[] = [
    { name: 'Dashboard', href: '/hrm/dashboard', icon: LayoutDashboard },
    { name: 'Employees', href: '/hrm/employees', icon: UsersIcon },
    { name: 'Attendance', href: '/hrm/attendance', icon: Clock },
    { name: 'Leaves', href: '/hrm/leaves', icon: CalendarDays },
    { name: 'Settings', href: '/hrm/settings', icon: Settings },
    { name: 'Holidays', href: '/hrm/holidays', icon: Calendar },
    { name: 'Payroll', href: '/hrm/payroll', icon: DollarSignIcon },
    { name: 'Performance', href: '/hrm/performance', icon: TrendingUp },
    { name: 'Noticeboard', href: '/hrm/noticeboard', icon: BellIcon },
];

const decisionHubSubItems: CrmSubItem[] = [
    { name: 'Dashboard', href: '/management/dashboard', icon: LayoutDashboard },
    { name: 'Meetings', href: '/management/meetings', icon: Calendar },
    { name: 'Decisions', href: '/management/decisions', icon: ClipboardCheck },
];

const systemNav: NavItem[] = [
    { name: 'Admin', href: '/admin', icon: Settings },
];

export default function AppLayout({ children }: PropsWithChildren) {
    const user = usePage().props.auth?.user;
    const permissions = (usePage().props as any).auth?.permissions as string[] || [];
    const isAdmin = user?.role?.name === 'admin';
    const can = (perm: string) => isAdmin || permissions.includes('*') || permissions.includes(perm);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
    const [chatSidebarOpen, setChatSidebarOpen] = useState(false);
    const [crmDropdownOpen, setCrmDropdownOpen] = useState(false);
    const [crmSlideUpOpen, setCrmSlideUpOpen] = useState(false);
    const [inventoryDropdownOpen, setInventoryDropdownOpen] = useState(false);
    const [inventorySlideUpOpen, setInventorySlideUpOpen] = useState(false);
    const [hrmDropdownOpen, setHrmDropdownOpen] = useState(false);
    const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
    const [productsSlideUpOpen, setProductsSlideUpOpen] = useState(false);
    const [ordersDropdownOpen, setOrdersDropdownOpen] = useState(false);
    const [productionDropdownOpen, setProductionDropdownOpen] = useState(false);
    const [decisionHubDropdownOpen, setDecisionHubDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const searchRef = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout>();

    // Theme toggle function
    const toggleTheme = () => {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(newTheme);
      localStorage.setItem('theme', newTheme);
    };

    // Load theme on mount
    useEffect(() => {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.classList.add(savedTheme);
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
        document.documentElement.classList.add('dark');
      }
    }, []);

    // Flash success messages
    const page = usePage();
    const flash = (page.props as any).flash as any;
    const flashKey = useMemo(() => JSON.stringify(flash), [flash]);
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flashKey]);

    const currentPath = useMemo(() => typeof window !== 'undefined' ? window.location.pathname : '', []);
    const isCrmPage = currentPath.startsWith('/crm');
    const isInventoryPage = currentPath.startsWith('/inventory') || currentPath.startsWith('/products');
    const isProductsPage = currentPath.startsWith('/products') || currentPath.startsWith('/services');
    const isOrdersPage = currentPath.startsWith('/orders');
    const isProductionPage = currentPath.startsWith('/production');
    const isHrmPage = currentPath.startsWith('/hrm');
    const isProcurementPage = currentPath.startsWith('/procurement');
    const isFinancePage = currentPath.startsWith('/finance');
    const isStudioPage = currentPath.startsWith('/studio');
    const isDecisionHubPage = currentPath.startsWith('/management');
    // Auto-expand dropdowns on their pages
    useEffect(() => {
        if (isCrmPage) {
            setCrmDropdownOpen(true);
        }
        if (isInventoryPage) {
            setInventoryDropdownOpen(true);
        }
        if (isHrmPage) {
            setHrmDropdownOpen(true);
        }
        if (isProductsPage) {
            setProductsDropdownOpen(true);
        }
        if (isOrdersPage) {
            setOrdersDropdownOpen(true);
        }
        if (isProductionPage) {
            setProductionDropdownOpen(true);
        }
        if (isDecisionHubPage) {
            setDecisionHubDropdownOpen(true);
        }
    }, [isCrmPage, isInventoryPage, isHrmPage, isProductsPage, isOrdersPage, isProductionPage, isDecisionHubPage]);

    // Search handler
    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (query.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await fetch(`/search?q=${encodeURIComponent(query)}`);
                const data = await response.json();
                setSearchResults(data.results || []);
                setShowResults(true);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsSearching(false);
            }
        }, 300);
    };

    // Keyboard shortcut (Ctrl+K or Cmd+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('#global-search') as HTMLInputElement;
                searchInput?.focus();
            }
            if (e.key === 'Escape') {
                setShowResults(false);
                setSearchQuery('');
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Mobile Header */}
            <header className="lg:hidden bg-white/80 dark:bg-[#13161f]/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-white/[0.06] px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setMobileMenuOpen(true)}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <Menu className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">DP</span>
                        </div>
                        <span className="font-semibold text-lg text-slate-900">DPS-ERP</span>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => setRightDrawerOpen(true)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        <LayoutDashboard className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                    {/* Theme Toggle */}
                    <button 
                        onClick={toggleTheme}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        aria-label="Toggle theme"
                    >
                        {theme === 'light' ? (
                            <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 10a1 1 0 10-2 0v1a1 1 0 102 0v-1zm-7.071.929a1 1 0 00-1.414 0l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 0zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>
                    <button 
                        onClick={() => setChatSidebarOpen(true)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative"
                    >
                        <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center ml-1">
                        <span className="text-sm font-medium text-white">
                            {user?.name?.charAt(0).toUpperCase() || 'A'}
                        </span>
                    </div>
                </div>
            </header>

            {/* Mobile Right Drawer */}
            {rightDrawerOpen && (
                <div className="lg:hidden fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm" onClick={() => setRightDrawerOpen(false)}>
                    <div 
                        className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-[#13161f] shadow-2xl p-0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-white text-lg">DPS-ERP</h3>
                                    <p className="text-white/70 text-sm">Enterprise Management</p>
                                </div>
                                <button onClick={() => setRightDrawerOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <nav className="space-y-1">
                                <Link
                                    href="/procurement/purchase-requests"
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                        currentPath === '/procurement'
                                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                                    }`}
                                    onClick={() => setRightDrawerOpen(false)}
                                >
                                    <ShoppingBag className="w-5 h-5" />
                                    <span className="font-medium">Procurement</span>
                                </Link>
                                <Link
                                    href="/hrm"
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                        currentPath === '/hrm'
                                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                                    }`}
                                    onClick={() => setRightDrawerOpen(false)}
                                >
                                    <UserCog className="w-5 h-5" />
                                    <span className="font-medium">HRM</span>
                                </Link>
                                <Link
                                    href="/studio"
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                        currentPath === '/studio'
                                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                                    }`}
                                    onClick={() => setRightDrawerOpen(false)}
                                >
                                    <Camera className="w-5 h-5" />
                                    <span className="font-medium">Studio</span>
                                </Link>
                                <Link
                                    href="/admin"
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                        currentPath === '/admin'
                                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                                    }`}
                                    onClick={() => setRightDrawerOpen(false)}
                                >
                                    <Settings className="w-5 h-5" />
                                    <span className="font-medium">Admin</span>
                                </Link>
                            </nav>
                            
                            <div className="mt-6">
                                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase px-4 mb-3">Quick Actions</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <Link
                                        href="/crm/create"
                                        className="flex flex-col items-center gap-2 px-3 py-3 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                                        onClick={() => setRightDrawerOpen(false)}
                                    >
                                        <Users className="w-5 h-5" />
                                        <span className="text-xs font-medium">Add Client</span>
                                    </Link>
                                    <Link
                                        href="/products/create"
                                        className="flex flex-col items-center gap-2 px-3 py-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
                                        onClick={() => setRightDrawerOpen(false)}
                                    >
                                        <Package className="w-5 h-5" />
                                        <span className="text-xs font-medium">Add Product</span>
                                    </Link>
                                    <Link
                                        href="/hrm/create"
                                        className="flex flex-col items-center gap-2 px-3 py-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
                                        onClick={() => setRightDrawerOpen(false)}
                                    >
                                        <UserCog className="w-5 h-5" />
                                        <span className="text-xs font-medium">Add Employee</span>
                                    </Link>
                                    <Link
                                        href="/production/create"
                                        className="flex flex-col items-center gap-2 px-3 py-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
                                        onClick={() => setRightDrawerOpen(false)}
                                    >
                                        <Factory className="w-5 h-5" />
                                        <span className="text-xs font-medium">New Job</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Slide-in Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-[80] bg-black/50" onClick={() => setMobileMenuOpen(false)}>
                    <div 
                        className="absolute left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-4 border-b border-slate-200">
                        <span className="font-semibold text-lg text-slate-900 dark:text-slate-100">DPS-ERP</span>
                            <button onClick={() => setMobileMenuOpen(false)}>
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <nav className="flex-1 overflow-y-auto scrollbar-thin p-4 pb-24 space-y-1">
                            {/* CRM Dropdown */}
                            <div className="mb-2">
                                <button
                                    onClick={() => setCrmDropdownOpen(!crmDropdownOpen)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                                        isCrmPage
                                            ? 'bg-slate-900 text-white'
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5" />
                                        CRM
                                    </div>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${crmDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {crmDropdownOpen && (
                                    <div className="ml-4 mt-1 space-y-1 border-l border-slate-200 pl-3">
                                        {crmSubItems.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                                    currentPath === item.href
                                                        ? 'bg-slate-100 text-slate-900 font-medium'
                                                        : 'text-slate-500 hover:bg-slate-50'
                                                }`}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <item.icon className="w-4 h-4" />
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Inventory Dropdown */}
                            <div className="mb-2">
                                <div className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                                    isInventoryPage
                                        ? 'bg-slate-900 text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}>
                                    <Link
                                        href="/inventory"
                                        className="flex items-center gap-3 flex-1"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Package className="w-5 h-5" />
                                        Inventory
                                    </Link>
                                    <button
                                        onClick={() => setInventoryDropdownOpen(!inventoryDropdownOpen)}
                                        className="p-1 rounded hover:bg-black/10 transition-colors"
                                        aria-label="Toggle inventory dropdown"
                                    >
                                        <ChevronDown className={`w-4 h-4 transition-transform ${inventoryDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>
                                {inventoryDropdownOpen && (
                                    <div className="ml-4 mt-1 space-y-1 border-l border-slate-200 pl-3">
                                        {inventorySubItems.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                                    currentPath === item.href
                                                        ? 'bg-slate-100 text-slate-900 font-medium'
                                                        : 'text-slate-500 hover:bg-slate-50'
                                                }`}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <item.icon className="w-4 h-4" />
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {/* OPERATIONS Section */}
                            <div className="px-3 mt-2 mb-2">
                                <span className="text-xs text-slate-400 uppercase font-medium">Operations</span>
                            </div>
                            <Link href="/dashboard" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentPath === '/dashboard' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`} onClick={() => setMobileMenuOpen(false)}>
                                <LayoutDashboard className="w-5 h-5" />
                                Dashboard
                            </Link>

                            {/* Prices Dropdown */}
                            <div className="mb-2">
                                <button
                                    onClick={() => setProductsDropdownOpen(!productsDropdownOpen)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                                        isProductsPage
                                            ? 'bg-slate-900 text-white'
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Package className="w-5 h-5" />
                                        Prices
                                    </div>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${productsDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {productsDropdownOpen && (
                                    <div className="ml-4 mt-1 space-y-1 border-l border-slate-200 pl-3">
                                        {productsSubItemsFull.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                                    currentPath === item.href
                                                        ? 'bg-slate-100 text-slate-900 font-medium'
                                                        : 'text-slate-500 hover:bg-slate-50'
                                                }`}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <item.icon className="w-4 h-4" />
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Orders Dropdown */}
                            <div className="mb-2">
                                <button
                                    onClick={() => setOrdersDropdownOpen(!ordersDropdownOpen)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                                        isOrdersPage
                                            ? 'bg-slate-900 text-white'
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <ShoppingCart className="w-5 h-5" />
                                        Orders
                                    </div>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${ordersDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {ordersDropdownOpen && (
                                    <div className="ml-4 mt-1 space-y-1 border-l border-slate-200 pl-3">
                                        {ordersSubItems.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                                    currentPath === item.href
                                                        ? 'bg-slate-100 text-slate-900 font-medium'
                                                        : 'text-slate-500 hover:bg-slate-50'
                                                }`}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <item.icon className="w-4 h-4" />
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Production Dropdown */}
                            <div className="mb-2">
                                <button
                                    onClick={() => setProductionDropdownOpen(!productionDropdownOpen)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                                        isProductionPage
                                            ? 'bg-slate-900 text-white'
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Factory className="w-5 h-5" />
                                        Production
                                    </div>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${productionDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {productionDropdownOpen && (
                                    <div className="ml-4 mt-1 space-y-1 border-l border-slate-200 pl-3">
                                        {productionSubItems.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                                    currentPath === item.href
                                                        ? 'bg-slate-100 text-slate-900 font-medium'
                                                        : 'text-slate-500 hover:bg-slate-50'
                                                }`}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <item.icon className="w-4 h-4" />
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Enterprise Nav Mapping (Remaining) */}
                            {enterpriseNav.filter(item => !['Orders', 'Production'].includes(item.name)).map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                        currentPath === item.href
                                            ? 'bg-slate-900 text-white'
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.name}
                                </Link>
                            ))}
                            
                            {/* MANAGEMENT Section */}
                            <div className="px-3 mt-4 pt-4 mb-2 border-t border-slate-200">
                                <span className="text-xs text-slate-400 uppercase font-medium">Management</span>
                            </div>

                            {/* HRM Dropdown */}
                            <div className="mb-2">
                                <button
                                    onClick={() => setHrmDropdownOpen(!hrmDropdownOpen)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                                        isHrmPage
                                            ? 'bg-slate-900 text-white'
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <UserCog className="w-5 h-5" />
                                        HRM
                                    </div>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${hrmDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {hrmDropdownOpen && (
                                    <div className="ml-4 mt-1 space-y-1 border-l border-slate-200 pl-3">
                                        {hrmSubItems.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                                    currentPath === item.href
                                                        ? 'bg-slate-100 text-slate-900 font-medium'
                                                        : 'text-slate-500 hover:bg-slate-50'
                                                }`}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <item.icon className="w-4 h-4" />
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Decision Hub Dropdown */}
                            {can('decision_hub.view') && <div className="mb-2">
                                <button
                                    onClick={() => setDecisionHubDropdownOpen(!decisionHubDropdownOpen)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                                        isDecisionHubPage
                                            ? 'bg-slate-900 text-white'
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <ClipboardCheck className="w-5 h-5" />
                                        Decision Hub
                                    </div>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${decisionHubDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {decisionHubDropdownOpen && (
                                    <div className="ml-4 mt-1 space-y-1 border-l border-slate-200 pl-3">
                                        {decisionHubSubItems.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                                    currentPath === item.href
                                                        ? 'bg-slate-100 text-slate-900 font-medium'
                                                        : 'text-slate-500 hover:bg-slate-50'
                                                }`}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <item.icon className="w-4 h-4" />
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>}

                            {/* Management Nav Mapping (Remaining) */}
                            {managementNav.filter(item => item.name !== 'HRM').map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                        (item.name === 'Procurement' && isProcurementPage) ||
                                        (item.name === 'Finance' && isFinancePage)
                                            ? 'bg-slate-900 text-white'
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.name}
                                </Link>
                            ))}
                            
                            {/* BUSINESS Section */}
                            <div className="px-3 mt-4 pt-4 mb-2 border-t border-slate-200">
                                <span className="text-xs text-slate-400 uppercase font-medium">Business</span>
                            </div>
                            <Link href="/studio" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isStudioPage ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`} onClick={() => setMobileMenuOpen(false)}>
                                <Camera className="w-5 h-5" />
                                Studio
                            </Link>
                            
                            {/* SYSTEM Section */}
                            <div className="px-3 mt-4 pt-4 mb-2 border-t border-slate-200">
                                <span className="text-xs text-slate-400 uppercase font-medium">System</span>
                            </div>
                            {systemNav.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                        currentPath === item.href
                                            ? 'bg-slate-900 text-white'
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className={`hidden lg:flex flex-col fixed left-0 top-0 bottom-0 bg-white dark:bg-[#13161f] border-r border-slate-200 dark:border-white/[0.06] transition-all duration-200 ${
                sidebarOpen ? 'w-60' : 'w-16'
            }`}>
                {/* Sidebar Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-white/[0.06]">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">DP</span>
                        </div>
                        {sidebarOpen && <span className="font-semibold text-slate-900">DPS-ERP</span>}
                    </Link>
                    <button 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                    >
                        <ChevronLeft className={`w-4 h-4 text-slate-500 transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto scrollbar-thin py-4">
                    <div className="px-3 mb-2">
                        {sidebarOpen && <span className="text-xs text-slate-400 uppercase font-medium">Enterprise</span>}
                    </div>
                    {/* CRM Dropdown */}
                    {can('crm.view') && <div className="px-3 mb-1">
                        {sidebarOpen ? (
                            <button
                                onClick={() => setCrmDropdownOpen(!crmDropdownOpen)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                                    isCrmPage
                                        ? 'bg-slate-900 text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Users className="w-5 h-5" />
                                    <span>CRM</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 transition-transform ${crmDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                        ) : (
                            <Link
                                href="/crm"
                                className={`flex items-center justify-center px-3 py-2 rounded-lg transition-colors ${
                                    isCrmPage
                                        ? 'bg-slate-900 text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <Users className="w-5 h-5" />
                            </Link>
                        )}
                        {crmDropdownOpen && sidebarOpen && (
                            <div className="mt-1 space-y-1">
                                {crmSubItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                            currentPath === item.href
                                                ? 'bg-slate-100 text-slate-900 font-medium'
                                                : 'text-slate-500 hover:bg-slate-50'
                                        }`}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                    }
                    {/* Inventory Dropdown */}
                    {can('inventory.view') && <div className="px-3 mb-1">
                        {sidebarOpen ? (
                            <div className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                                isInventoryPage
                                    ? 'bg-slate-900 text-white'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}>
                                <Link
                                    href="/inventory"
                                    className="flex items-center gap-3 flex-1"
                                >
                                    <Package className="w-5 h-5" />
                                    <span>Inventory</span>
                                </Link>
                                <button
                                    onClick={() => setInventoryDropdownOpen(!inventoryDropdownOpen)}
                                    className="p-1 rounded hover:bg-black/10 transition-colors"
                                    aria-label="Toggle inventory dropdown"
                                >
                                    <ChevronDown className={`w-4 h-4 transition-transform ${inventoryDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                        ) : (
                                 <Link
                                     href="/inventory"
                                     className={`flex items-center justify-center px-3 py-2 rounded-lg transition-colors ${
                                         isInventoryPage
                                             ? 'bg-slate-900 text-white'
                                             : 'text-slate-600 hover:bg-slate-100'
                                     }`}
                                 >
                                     <Package className="w-5 h-5" />
                                 </Link>
                        )}
                        {inventoryDropdownOpen && sidebarOpen && (
                            <div className="mt-1 space-y-1">
                                {inventorySubItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                            currentPath === item.href
                                                ? 'bg-slate-100 text-slate-900 font-medium'
                                                : 'text-slate-500 hover:bg-slate-50'
                                        }`}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>}

                    {/* Procurement Link */}
                    {can('procurement.view') && <div className="px-3 mb-1">
                        <Link
                            href="/procurement/purchase-requests"
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                isProcurementPage
                                    ? 'bg-slate-900 text-white'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            <ShoppingBag className="w-5 h-5 flex-shrink-0" />
                            {sidebarOpen && <span>Procurement</span>}
                        </Link>
                    </div>}
                    
                    {/* OPERATIONS Section */}
                    <div className="px-3 mt-4 mb-2">
                        {sidebarOpen && <span className="text-xs text-slate-400 uppercase font-medium">Operations</span>}
                    </div>
                    <div className="space-y-1 px-3">
                        <Link href="/dashboard" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentPath === '/dashboard' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                            {sidebarOpen && <span>Dashboard</span>}
                        </Link>
                        
                        {/* Prices Dropdown */}
                        {can('products.view') && <div className="space-y-1">
                            {sidebarOpen ? (
                                <button
                                    onClick={() => setProductsDropdownOpen(!productsDropdownOpen)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                                        isProductsPage
                                            ? 'bg-slate-900 text-white'
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Package className="w-5 h-5 flex-shrink-0" />
                                        <span>Prices</span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${productsDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                            ) : (
                                <Link
                                    href="/products"
                                    className={`flex items-center justify-center px-3 py-2 rounded-lg transition-colors ${
                                        isProductsPage
                                            ? 'bg-slate-900 text-white'
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <Package className="w-5 h-5" />
                                </Link>
                            )}
                            {productsDropdownOpen && sidebarOpen && (
                                <div className="mt-1 space-y-1 ml-4 border-l-2 border-slate-200 pl-2">
                                    {productsSubItemsFull.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                                currentPath === item.href
                                                    ? 'bg-slate-100 text-slate-900 font-medium'
                                                    : 'text-slate-500 hover:bg-slate-50'
                                            }`}
                                        >
                                            <item.icon className="w-4 h-4" />
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>}
                        
                        {/* Orders Dropdown */}
                        {can('orders.view') && <div className="space-y-1">
                            {sidebarOpen ? (
                                <button
                                    onClick={() => setOrdersDropdownOpen(!ordersDropdownOpen)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                                        isOrdersPage
                                            ? 'bg-slate-900 text-white'
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <ShoppingCart className="w-5 h-5 flex-shrink-0" />
                                        <span>Orders</span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${ordersDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                            ) : (
                                <Link
                                    href="/orders"
                                    className={`flex items-center justify-center px-3 py-2 rounded-lg transition-colors ${
                                        isOrdersPage
                                            ? 'bg-slate-900 text-white'
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                </Link>
                            )}
                            {ordersDropdownOpen && sidebarOpen && (
                                <div className="mt-1 space-y-1 ml-4 border-l-2 border-slate-200 pl-2">
                                    {ordersSubItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                                currentPath === item.href
                                                    ? 'bg-slate-100 text-slate-900 font-medium'
                                                    : 'text-slate-500 hover:bg-slate-50'
                                            }`}
                                        >
                                            <item.icon className="w-4 h-4" />
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>}
                        
                        {/* Production Dropdown */}
                        {can('production.view') && <div className="space-y-1">
                            {sidebarOpen ? (
                                <button
                                    onClick={() => setProductionDropdownOpen(!productionDropdownOpen)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                                        isProductionPage
                                            ? 'bg-slate-900 text-white'
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Factory className="w-5 h-5 flex-shrink-0" />
                                        <span>Production</span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${productionDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                            ) : (
                                <Link
                                    href="/production"
                                    className={`flex items-center justify-center px-3 py-2 rounded-lg transition-colors ${
                                        isProductionPage
                                            ? 'bg-slate-900 text-white'
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <Factory className="w-5 h-5" />
                                </Link>
                            )}
                            {productionDropdownOpen && sidebarOpen && (
                                <div className="mt-1 space-y-1 ml-4 border-l-2 border-slate-200 pl-2">
                                    {productionSubItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                                currentPath === item.href
                                                    ? 'bg-slate-100 text-slate-900 font-medium'
                                                    : 'text-slate-500 hover:bg-slate-50'
                                            }`}
                                        >
                                            <item.icon className="w-4 h-4" />
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>}
                    </div>
                    
                    {/* MANAGEMENT Section */}
                    {(can('hrm.view') || can('finance.view') || can('decision_hub.view')) && <div className="px-3 mt-6 mb-2">
                        {sidebarOpen && <span className="text-xs text-slate-400 uppercase font-medium">Management</span>}
                    </div>}
                    
                    {/* HRM Dropdown */}
                    {can('hrm.view') && <div className="space-y-1 px-3 mb-1">
                        {sidebarOpen ? (
                            <button
                                onClick={() => setHrmDropdownOpen(!hrmDropdownOpen)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                                    isHrmPage
                                        ? 'bg-slate-900 text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <UserCog className="w-5 h-5 flex-shrink-0" />
                                    <span>HRM</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 transition-transform ${hrmDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                        ) : (
                            <Link
                                href="/hrm/dashboard"
                                className={`flex items-center justify-center px-3 py-2 rounded-lg transition-colors ${
                                    isHrmPage
                                        ? 'bg-slate-900 text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <UserCog className="w-5 h-5" />
                            </Link>
                        )}
                        {hrmDropdownOpen && sidebarOpen && (
                            <div className="mt-1 space-y-1">
                                {hrmSubItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                            currentPath === item.href
                                                ? 'bg-slate-100 text-slate-900 font-medium'
                                                : 'text-slate-500 hover:bg-slate-50'
                                        }`}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>}

                    {can('finance.view') && <Link href="/finance" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isFinancePage ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                        <DollarSign className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span>Finance</span>}
                    </Link>}

                    {/* Decision Hub Dropdown */}
                    {can('decision_hub.view') && <div className="space-y-1 px-3 mb-1">
                        {sidebarOpen ? (
                            <button
                                onClick={() => setDecisionHubDropdownOpen(!decisionHubDropdownOpen)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                                    isDecisionHubPage
                                        ? 'bg-slate-900 text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <ClipboardCheck className="w-5 h-5 flex-shrink-0" />
                                    <span>Decision Hub</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 transition-transform ${decisionHubDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                        ) : (
                            <Link
                                href="/management/dashboard"
                                className={`flex items-center justify-center px-3 py-2 rounded-lg transition-colors ${
                                    isDecisionHubPage
                                        ? 'bg-slate-900 text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <ClipboardCheck className="w-5 h-5" />
                            </Link>
                        )}
                        {decisionHubDropdownOpen && sidebarOpen && (
                            <div className="mt-1 space-y-1">
                                {decisionHubSubItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                            currentPath === item.href
                                                ? 'bg-slate-100 text-slate-900 font-medium'
                                                : 'text-slate-500 hover:bg-slate-50'
                                        }`}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>}
                    
                    {/* BUSINESS Section */}
                    {can('studio.view') && <div className="px-3 mt-6 mb-2">
                        {sidebarOpen && <span className="text-xs text-slate-400 uppercase font-medium">Business</span>}
                    </div>}
                    <div className="space-y-1 px-3">
                        {can('studio.view') && <Link href="/studio" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isStudioPage ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                            <Camera className="w-5 h-5 flex-shrink-0" />
                            {sidebarOpen && <span>Studio</span>}
                        </Link>}
                    </div>
                    
                    {/* SYSTEM Section */}
                    {(can('admin.manage_users') || can('admin.manage_roles') || can('admin.manage_settings')) && <div className="px-3 mt-6 mb-2">
                        {sidebarOpen && <span className="text-xs text-slate-400 uppercase font-medium">System</span>}
                    </div>}
                    <div className="space-y-1 px-3">
                        {(can('admin.manage_users') || can('admin.manage_roles') || can('admin.manage_settings')) && systemNav.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                    currentPath === item.href
                                        ? 'bg-slate-900 text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                {sidebarOpen && <span>{item.name}</span>}
                            </Link>
                        ))}
                    </div>
                </nav>

                {/* User Section */}
                <div className="p-3 border-t border-slate-200 dark:border-white/[0.06]">
                    <div className={`flex items-center gap-3 ${!sidebarOpen ? 'justify-center' : ''}`}>
                        <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-white">
                                {user?.name?.charAt(0).toUpperCase() || 'A'}
                            </span>
                        </div>
                        {sidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{user?.name || 'Admin'}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email || 'admin@dps-erp.com'}</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Desktop Header */}
            <header className="hidden lg:flex h-16 items-center justify-between px-6 bg-white dark:bg-[#13161f] border-b border-slate-200 dark:border-white/[0.06]">
                <div className="flex-1"></div>
                <div className="flex-1 max-w-md mx-auto relative" ref={searchRef}>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            id="global-search"
                            type="text"
                            placeholder="Search... (Ctrl+K)"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                            className="glass-input w-full pl-10"
                        />
                    </div>
                    {/* Search Results Dropdown */}
                    {showResults && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a1e2a] border border-slate-200 dark:border-white/[0.06] rounded-lg shadow-lg overflow-hidden z-50 max-h-80 overflow-y-auto">
                            {isSearching ? (
                                <div className="p-4 text-center text-slate-400">Searching...</div>
                            ) : searchResults.length > 0 ? (
                                <div className="py-2">
                                    {searchResults.map((result, i) => (
                                        <Link
                                            key={i}
                                            href={result.href}
                                            onClick={() => {
                                                setShowResults(false);
                                                setSearchQuery('');
                                            }}
                                            className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
                                        >
                                            <div className="w-8 h-8 bg-slate-100 dark:bg-white/[0.06] rounded flex items-center justify-center text-xs text-slate-600 dark:text-slate-400">
                                                {result.type.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{result.title}</p>
                                                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{result.subtitle}</p>
                                            </div>
                                            <span className="text-xs text-slate-400 dark:text-slate-500">{result.type}</span>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-slate-400">No results found</div>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex-1 flex items-center justify-end gap-2">
                    <button 
                        onClick={toggleTheme}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        aria-label="Toggle theme"
                    >
                        {theme === 'light' ? (
                            <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 10a1 1 0 10-2 0v1a1 1 0 102 0v-1zm-7.071.929a1 1 0 00-1.414 0l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 0zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>
                    <button 
                        onClick={() => setChatSidebarOpen(true)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative"
                    >
                        <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    <Link 
                        href={route('logout')} 
                        method="post"
                        as="button"
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </Link>
                </div>
            </header>

            {/* Main Content + Chat Panel */}
            <div className="flex">
                <main className={`pt-16 lg:pt-0 ${sidebarOpen ? 'lg:pl-60' : 'lg:pl-16'} flex-1 min-w-0 transition-all duration-200 bg-slate-100 dark:bg-[#0c0e14]`}>
                    <div className="p-4 lg:p-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={usePage().url}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>

                {/* Desktop Chat Panel */}
                {chatSidebarOpen && (
                    <div className="hidden lg:block w-96 flex-shrink-0 sticky top-0 h-screen border-l border-slate-200 bg-white dark:bg-slate-900 z-10">
                        <ChatSidebar mode="panel" isOpen={chatSidebarOpen} onClose={() => setChatSidebarOpen(false)} />
                    </div>
                )}
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[70] bg-white/95 backdrop-blur-lg border-t border-slate-200/50 h-16 flex items-center justify-around px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <Link
                    href="/dashboard"
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                        currentPath === '/dashboard' 
                            ? 'text-indigo-600 bg-indigo-50' 
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Dashboard</span>
                </Link>
                <button
                    onClick={() => setCrmSlideUpOpen(true)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                        isCrmPage 
                            ? 'text-indigo-600 bg-indigo-50' 
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <Users className="w-5 h-5" />
                    <span className="text-[10px] font-medium">CRM</span>
                </button>
                <button
                    onClick={() => setInventorySlideUpOpen(true)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                        isInventoryPage 
                            ? 'text-indigo-600 bg-indigo-50' 
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <Package className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Inventory</span>
                </button>
                <button
                    onClick={() => setProductsSlideUpOpen(true)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                        isProductsPage 
                            ? 'text-indigo-600 bg-indigo-50' 
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <Package className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Prices</span>
                </button>
                <Link
                    href="/orders"
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                        currentPath === '/orders' 
                            ? 'text-indigo-600 bg-indigo-50' 
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <ShoppingCart className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Orders</span>
                </Link>
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                >
                    <Menu className="w-5 h-5" />
                    <span className="text-[10px] font-medium">More</span>
                </button>
            </nav>

            {/* CRM Slide-Up Panel */}
            {crmSlideUpOpen && (
                <>
                    <div className="lg:hidden fixed inset-0 z-[80] bg-black/30 backdrop-blur-sm" onClick={() => setCrmSlideUpOpen(false)} />
                    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[90] animate-slide-up">
                        <div className="bg-white rounded-t-3xl shadow-2xl overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                                        <Users className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">CRM</h3>
                                        <p className="text-xs text-slate-500">Client Management</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setCrmSlideUpOpen(false)}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                            <div className="p-4 space-y-2">
                                {crmSubItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setCrmSlideUpOpen(false)}
                                        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                                            currentPath === item.href
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo/25'
                                                : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                            currentPath === item.href ? 'bg-white/20' : 'bg-slate-100'
                                        }`}>
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                ))}
                            </div>
                            <div className="pb-8"></div>
                        </div>
                    </div>
                </>
            )}

            {/* Inventory Slide-Up Panel */}
            {inventorySlideUpOpen && (
                <>
                    <div className="lg:hidden fixed inset-0 z-[80] bg-black/30 backdrop-blur-sm" onClick={() => setInventorySlideUpOpen(false)} />
                    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[90] animate-slide-up">
                        <div className="bg-white rounded-t-3xl shadow-2xl overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                                        <Package className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">Inventory</h3>
                                        <p className="text-xs text-slate-500">Stock Management</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setInventorySlideUpOpen(false)}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                            <div className="p-4 space-y-2">
                                {inventorySubItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setInventorySlideUpOpen(false)}
                                        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                                            currentPath === item.href
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo/25'
                                                : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                            currentPath === item.href ? 'bg-white/20' : 'bg-slate-100'
                                        }`}>
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                ))}
                            </div>
                            <div className="pb-8"></div>
                        </div>
                    </div>
                </>
            )}

            {/* Products Slide-Up Panel */}
            {productsSlideUpOpen && (
                <>
                    <div className="lg:hidden fixed inset-0 z-[80] bg-black/30 backdrop-blur-sm" onClick={() => setProductsSlideUpOpen(false)} />
                    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[90] animate-slide-up">
                        <div className="bg-white rounded-t-3xl shadow-2xl overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                                        <Package className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">Prices</h3>
                                        <p className="text-xs text-slate-500">Manage Prices</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setProductsSlideUpOpen(false)}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                            <div className="p-4 space-y-2">
                                {productsSubItemsFull.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setProductsSlideUpOpen(false)}
                                        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                                            currentPath === item.href
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo/25'
                                                : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                            currentPath === item.href ? 'bg-white/20' : 'bg-slate-100'
                                        }`}>
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                ))}
                            </div>
                            <div className="pb-8"></div>
                        </div>
                    </div>
                </>
            )}

            {/* Mobile Content Padding */}
            <div className="lg:hidden pb-20"></div>
            <Toaster position="top-right" richColors closeButton />
            
            {/* Mobile Chat Overlay */}
            {chatSidebarOpen && (
                <div className="lg:hidden">
                    <ChatSidebar mode="overlay" isOpen={chatSidebarOpen} onClose={() => setChatSidebarOpen(false)} />
                </div>
            )}
        </div>
    );
}