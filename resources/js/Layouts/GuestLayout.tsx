import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[color:var(--color-bg)] px-4 py-10">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-[#8b0f0c]/15 blur-3xl dark:bg-[#8b0f0c]/10" />
                <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-[#8b0f0c]/10 blur-3xl dark:bg-[#8b0f0c]/10" />
            </div>

            <div className="relative w-full max-w-md">
                <div className="flex justify-center">
                    <Link href="/">
                        <ApplicationLogo className="h-24 w-auto" />
                    </Link>
                </div>

                <div className="glass-card !p-8 mt-8 sm:!p-10">{children}</div>
            </div>
        </div>
    );
}
