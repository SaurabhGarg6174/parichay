'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, LayoutDashboard, Settings, Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useState } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isAdmin = user?.roles?.includes('ADMIN');

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const NavLinks = () => (
        <>
            <Link
                href="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 px-3 py-2 rounded-xl text-sm font-semibold flex gap-2.5 items-center transition-all"

            >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
            </Link>
            {isAdmin && (
                <Link
                    href="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 px-3 py-2 rounded-xl text-sm font-semibold flex gap-2.5 items-center transition-all"

                >
                    <Settings className="w-4 h-4" />
                    Admin
                </Link>
            )}
        </>
    );

    const AuthLinks = () => (
        <div className="flex items-center gap-1.5 overflow-hidden">
            {user ? (
                <>
                    <div className="hidden md:block w-px h-4 bg-slate-200 dark:bg-slate-800 mx-2" />
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60 shadow-sm">
                        <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                            <UserIcon className="w-3.5 h-3.5 text-indigo-500" />
                        </div>
                        <span className="text-xs font-black text-slate-700 dark:text-slate-300 max-w-[120px] truncate uppercase tracking-wider">
                            {user.email.split('@')[0]}
                        </span>
                    </div>
                    <button
                        onClick={() => { logout(); setIsMenuOpen(false); }}
                        className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all duration-300"
                        title="Logout"
                    >
                        <LogOut className="w-4.5 h-4.5" />
                    </button>
                </>
            ) : (
                <div className="flex items-center gap-2">
                    <Link
                        href="/login"
                        className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white px-4 py-2 transition-colors"
                    >
                        Login
                    </Link>
                    <Link
                        href="/register"
                        className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
                    >
                        Join Now
                    </Link>
                </div>
            )}
        </div>
    );

    return (
        <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800/60 sticky top-0 z-[100] transition-all duration-500">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between h-20">
                    <div className="flex items-center">
                        <Link href="/" className="group flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:rotate-6 transition-transform duration-500">
                                <span className="text-white font-black text-xl">P</span>
                            </div>
                            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:tracking-normal transition-all duration-500">
                                Parichay<span className="text-indigo-600">.</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-4">
                        {user && <NavLinks />}
                        <AuthLinks />
                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2" />
                        <ThemeToggle />
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center md:hidden gap-3">
                        <ThemeToggle />
                        <button
                            onClick={toggleMenu}
                            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl animate-in slide-in-from-top duration-500 p-6 space-y-6">
                    {user && (
                        <div className="grid gap-2">
                            <NavLinks />
                        </div>
                    )}
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                        <AuthLinks />
                    </div>
                </div>
            )}
        </nav>
    );

}
