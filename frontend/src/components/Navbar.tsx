'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Settings, Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useState } from 'react';

const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

export default function Navbar() {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    const isAdmin = user?.roles?.includes('ADMIN');

    if (AUTH_ROUTES.includes(pathname)) return null;

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const initials = user?.email?.slice(0, 2).toUpperCase() ?? '';

    const NavLinks = () => (
        <>
            <Link
                href="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
            >
                <LayoutDashboard className="h-4 w-4" aria-hidden />
                Dashboard
            </Link>
            {isAdmin && (
                <Link
                    href="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                >
                    <Settings className="h-4 w-4" aria-hidden />
                    Admin
                </Link>
            )}
        </>
    );

    const AuthLinks = () => (
        <div className="flex items-center gap-2">
            {user ? (
                <>
                    <div className="flex items-center gap-2.5 rounded-lg border border-transparent px-2 py-1.5 transition-colors hover:border-border hover:bg-surface-hover">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-subtle text-[11px] font-semibold text-primary">
                            {initials}
                        </span>
                        <span className="max-w-[140px] truncate text-[13px] font-semibold text-foreground">
                            {user.email.split('@')[0]}
                        </span>
                    </div>
                    <button
                        onClick={() => { logout(); setIsMenuOpen(false); }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-muted hover:text-danger"
                        title="Logout"
                        aria-label="Logout"
                    >
                        <LogOut className="h-4 w-4" aria-hidden />
                    </button>
                </>
            ) : (
                <div className="flex items-center gap-2">
                    <Link
                        href="/login"
                        className="rounded-lg px-3.5 py-2 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                    >
                        Sign in
                    </Link>
                    <Link
                        href="/register"
                        className="rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover"
                    >
                        Create profile
                    </Link>
                </div>
            )}
        </div>
    );

    return (
        <nav className="sticky top-0 z-[100] border-b border-border bg-surface">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="flex h-14 items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-[15px] font-semibold text-white">
                            प
                        </span>
                        <span className="leading-tight">
                            <span className="block text-[15px] font-semibold tracking-tight text-foreground">Parichay</span>
                            <span className="block text-[10px] font-medium uppercase tracking-[0.06em] text-faint">by Aggarjan Patrika</span>
                        </span>
                    </Link>

                    {/* Desktop menu */}
                    <div className="hidden items-center gap-1 md:flex">
                        {user && <NavLinks />}
                        <AuthLinks />
                        <div className="mx-2 h-5 w-px bg-border" />
                        <ThemeToggle />
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center gap-2 md:hidden">
                        <ThemeToggle />
                        <button
                            onClick={toggleMenu}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                        >
                            {isMenuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="space-y-4 border-t border-border bg-surface p-4 md:hidden">
                    {user && (
                        <div className="grid gap-1">
                            <NavLinks />
                        </div>
                    )}
                    <div className="border-t border-border pt-4">
                        <AuthLinks />
                    </div>
                </div>
            )}
        </nav>
    );
}
