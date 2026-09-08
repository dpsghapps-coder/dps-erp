import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Megaphone, PenTool, Printer, Tag } from 'lucide-react';

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

            <div className="relative min-h-screen overflow-hidden bg-white px-4 py-14 dark:bg-[#0b0d13] sm:py-20">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl dark:bg-sky-500/10" />
                    <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-pink-500/15 blur-3xl dark:bg-pink-500/10" />
                    <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-amber-400/15 blur-3xl dark:bg-amber-400/10" />
                </div>

                <div className="relative mx-auto w-full max-w-5xl">
                    <img
                        src="/images/dp-logo.webp"
                        alt="DP Solutions Gh."
                        className="h-24 w-auto sm:h-28"
                    />

                    <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
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
                            <h1 className="mt-1 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl dark:text-white">
                                DP Solutions
                            </h1>
                            <p className="mt-4 max-w-md text-base leading-relaxed text-[color:var(--color-text-secondary)]">
                                We bring your ideas to life with creative
                                designs, quality prints and powerful
                                advertising solutions.
                            </p>

                            <div className="mt-8">
                                <Link
                                    href={auth?.user ? route('dashboard') : route('login')}
                                    className="inline-flex items-center gap-2 rounded-xl border-2 border-[#8b0f0c] bg-white px-8 py-3.5 font-semibold text-[#8b0f0c] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#8b0f0c] hover:text-white hover:shadow-xl dark:bg-transparent"
                                >
                                    {auth?.user ? 'Continue to Dashboard' : 'Continue to Login'}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-2xl shadow-lg">
                            <img
                                src="/images/dps-hero.webp"
                                alt="Design, print and advertising mockups by DP Solutions"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>

                    <div className="mt-16 grid grid-cols-2 gap-8 border-t border-slate-200/60 pt-10 sm:grid-cols-4 dark:border-white/[0.06]">
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
                </div>
            </div>
        </>
    );
}
