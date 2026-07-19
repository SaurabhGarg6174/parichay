import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

export default function AuthCard({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <div className="flex items-center justify-between px-5 py-4 sm:px-8">
                <Link href="/" className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-[15px] font-semibold text-white">
                        प
                    </span>
                    <span className="leading-tight">
                        <span className="block text-[15px] font-semibold tracking-tight text-foreground">Parichay</span>
                        <span className="block text-[10px] font-medium uppercase tracking-[0.06em] text-faint">by Aggarjan Patrika</span>
                    </span>
                </Link>
                <ThemeToggle />
            </div>

            <div className="flex flex-1 items-start justify-center px-4 pb-16 pt-10 sm:items-center sm:pt-0">
                <div className="w-full max-w-[400px] rounded-xl border border-border bg-surface p-6 shadow-card sm:p-8">
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
                    {subtitle && <p className="mt-1 text-[13.5px] text-muted-foreground">{subtitle}</p>}
                    <div className="mt-6">{children}</div>
                </div>
            </div>
        </div>
    );
}
