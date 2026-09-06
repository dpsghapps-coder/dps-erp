import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Megaphone, PenTool, Printer, Tag, X } from 'lucide-react';

const features = [
    {
        icon: PenTool,
        title: 'Design',
        description: 'Creative designs that inspire.',
        color: 'bg-sky-500',
    },
    {
        icon: Tag,
        title: 'Brand',
        description: 'Build a stronger identity.',
        color: 'bg-pink-600',
    },
    {
        icon: Printer,
        title: 'Print',
        description: 'High quality prints that last.',
        color: 'bg-amber-400',
    },
    {
        icon: Megaphone,
        title: 'Advertise',
        description: 'Reach more. Grow faster.',
        color: 'bg-emerald-500',
    },
];

export default function Welcome({ auth }: PageProps) {
    return (
        <>
            <Head title="Welcome">
                <link
                    href="https://fonts.bunny.net/css?family=caveat:700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div className="relative min-h-screen overflow-hidden bg-[color:var(--color-bg)] px-4 py-10 sm:py-16">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl dark:bg-sky-500/10" />
                    <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-pink-500/15 blur-3xl dark:bg-pink-500/10" />
                    <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-amber-400/15 blur-3xl dark:bg-amber-400/10" />
                </div>

                <div className="relative mx-auto w-full max-w-4xl">
                    <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-2xl dark:border-white/[0.06] dark:bg-[#13161f]">
                        {/* Decorative brand waves */}
                        <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rotate-12 rounded-full bg-sky-500/25 blur-2xl" />
                        <div className="pointer-events-none absolute -bottom-20 left-16 h-48 w-48 rotate-12 rounded-full bg-pink-600/20 blur-2xl" />
                        <div className="pointer-events-none absolute -right-16 -bottom-16 h-56 w-56 -rotate-12 rounded-full bg-amber-400/25 blur-2xl" />

                        {auth?.user ? (
                            <Link
                                href={route('dashboard')}
                                className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </Link>
                        ) : null}

                        <div className="relative px-6 py-10 sm:px-10 sm:py-12">
                            <img
                                src="/images/dp-logo.webp"
                                alt="DP Solutions Gh."
                                className="h-24 w-auto sm:h-28"
                            />

                            <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-8">
                                <div>
                                    <p
                                        className="text-4xl sm:text-5xl"
                                        style={{
                                            fontFamily: "'Caveat', cursive",
                                            color: '#8b0f0c',
                                        }}
                                    >
                                        Welcome to
                                    </p>
                                    <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                                        DP Solutions
                                    </h1>
                                    <p className="mt-4 text-sm leading-relaxed text-[color:var(--color-text-secondary)] sm:text-base">
                                        We bring your ideas to life with creative
                                        designs, quality prints and powerful
                                        advertising solutions.
                                    </p>
                                </div>

                                <div className="overflow-hidden rounded-2xl shadow-lg">
                                    <img
                                        src="/images/dps-hero.webp"
                                        alt="Design, print and advertising mockups by DP Solutions"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            </div>

                            <div className="mt-10 grid grid-cols-2 gap-6 border-t border-slate-200/60 pt-8 sm:grid-cols-4 dark:border-white/[0.06]">
                                {features.map(({ icon: Icon, title, description, color }) => (
                                    <div key={title} className="text-center">
                                        <div
                                            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${color} shadow-md`}
                                        >
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>
                                        <p className="mt-3 font-bold text-slate-900 dark:text-white">
                                            {title}
                                        </p>
                                        <p className="mt-1 text-xs text-[color:var(--color-text-secondary)] sm:text-sm">
                                            {description}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 flex justify-center">
                                <Link
                                    href={auth?.user ? route('dashboard') : route('login')}
                                    className="inline-flex items-center gap-2 rounded-xl border-2 border-[#8b0f0c] bg-white px-8 py-3.5 font-semibold text-[#8b0f0c] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#8b0f0c] hover:text-white hover:shadow-xl"
                                >
                                    {auth?.user ? 'Continue to Dashboard' : 'Continue to Login'}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
