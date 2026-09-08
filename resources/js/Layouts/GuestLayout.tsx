import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            <div className="relative hidden overflow-hidden bg-[#8b0f0c] lg:flex lg:flex-col lg:justify-between lg:p-12">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-24 -left-16 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-24 -right-16 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
                </div>

                <Link href="/" className="relative z-10 inline-flex w-fit rounded-xl bg-white/95 p-3 shadow-lg">
                    <ApplicationLogo className="h-12 w-auto" />
                </Link>

                <div className="relative z-10 max-w-md">
                    <p className="text-3xl font-black tracking-tight text-white">DPS-ERP</p>
                    <p className="mt-3 text-base leading-relaxed text-white/80">
                        Manage clients, orders, production, inventory, finance and more — all in one place.
                    </p>
                </div>

                <p className="relative z-10 text-sm text-white/50">DP Solutions Gh. — Total Printing Solutions</p>
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
