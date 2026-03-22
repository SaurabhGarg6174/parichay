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
        <>
            {user ? (
                <>
                    <div className="hidden md:block border-l h-6 border-gray-300 dark:border-gray-700 mx-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2 px-3 py-2">
                        <UserIcon className="w-4 h-4" /> <span className="max-w-[150px] truncate">{user.email}</span>
                    </span>
                    <button
                        onClick={() => { logout(); setIsMenuOpen(false); }}
                        className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 px-3 py-2 rounded-md text-sm font-medium flex gap-2 items-center transition-colors w-full md:w-auto"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </>
            ) : (
                <div className="flex flex-col md:flex-row gap-2 md:items-center">
                    <Link
                        href="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                        Login
                    </Link>
                    <Link
                        href="/register"
                        onClick={() => setIsMenuOpen(false)}
                        className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-center"
                    >
                        Register
                    </Link>
                </div>
            )}
        </>
    );

    return (
        <nav className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-100 dark:border-slate-800 transition-colors duration-300 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Parichay
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-2">
                        {user && <NavLinks />}
                        <AuthLinks />
                        <div className="border-l h-6 border-gray-300 dark:border-gray-700 mx-1" />
                        <ThemeToggle />
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center md:hidden gap-2">
                        <ThemeToggle />
                        <button
                            onClick={toggleMenu}
                            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none transition-colors"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 animate-in slide-in-from-top duration-200">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {user && (
                            <div className="mb-2">
                                <NavLinks />
                            </div>
                        )}
                        <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
                            <AuthLinks />
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
