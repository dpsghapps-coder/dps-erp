import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import { Boxes, Factory, ShoppingCart, Users } from 'lucide-react';
import { PropsWithChildren } from 'react';

const features = [
    { icon: Users, label: 'CRM & Clients' },
    { icon: ShoppingCart, label: 'Orders & Sales' },
    { icon: Factory, label: 'Production' },
    { icon: Boxes, label: 'Inventory' },
];

export default function Guest({ children }: PropsWithChildren) {
    const appVersion = (usePage().props as any).appVersion as string | undefined;

    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            <div className="relative hidden overflow-hidden bg-[#8b0f0c] lg:flex lg:flex-col lg:justify-between lg:p-12">
                {/* Dot-grid texture */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.15]"
                    style={{
                        backgroundImage: 'radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)',
                        backgroundSize: '26px 26px',
                    }}
                />

                {/* Diagonal stripe texture */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage:
                            'repeating-linear-gradient(45deg, rgba(255,255,255,0.9) 0, rgba(255,255,255,0.9) 1px, transparent 1px, transparent 16px)',
                    }}
                />

                {/* Concentric decorative rings */}
                <div className="pointer-events-none absolute -right-32 top-1/2 h-[460px] w-[460px] -translate-y-1/2 rounded-full border border-white/10" />
                <div className="pointer-events-none absolute -right-16 top-1/2 h-[340px] w-[340px] -translate-y-1/2 rounded-full border border-white/[0.08]" />
                <div className="pointer-events-none absolute right-8 top-1/2 h-[220px] w-[220px] -translate-y-1/2 rounded-full border border-white/[0.06]" />

                {/* Blurred color blobs */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-24 -left-16 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />
                    <div className="absolute -bottom-24 -right-16 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-10 left-1/4 h-64 w-64 rounded-full bg-rose-400/20 blur-3xl" />
                </div>

                <Link href="/" className="relative z-10 inline-flex w-fit rounded-xl bg-white/95 p-3 shadow-lg">
                    <ApplicationLogo className="h-12 w-auto" />
                </Link>

                <div className="relative z-10 max-w-md">
                    <p className="text-3xl font-black tracking-tight text-white">DPS-ERP</p>
                    <p className="mt-3 text-base leading-relaxed text-white/80">
                        Manage clients, orders, production, inventory, finance and more — all in one place.
                    </p>

                    <div className="mt-8 grid grid-cols-2 gap-3">
                        {features.map(({ icon: Icon, label }) => (
                            <div
                                key={label}
                                className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/10 px-3 py-2.5 backdrop-blur-sm"
                            >
                                <Icon className="h-4 w-4 shrink-0 text-white/90" />
                                <span className="text-sm font-medium text-white/90">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="relative z-10 text-sm text-white/50">
                    DP Solutions Gh. — Total Printing Solutions{appVersion ? ` · v${appVersion}` : ''}
                </p>
            </div>

            <div className="flex flex-col justify-center bg-[color:var(--color-bg)] px-6 py-12 sm:px-12 lg:px-16">
                <div className="mx-auto w-full max-w-sm">
                    <Link href="/" className="mb-8 flex justify-center lg:hidden">
                        <ApplicationLogo className="h-16 w-auto" />
                    </Link>

                    {children}
                </div>
            </div>
        </div>
    );
}
