'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, LayoutDashboard, Settings } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export default function Navbar() {
    const { user, logout } = useAuth();
    const isAdmin = user?.roles?.some(role => role.name === 'ADMIN');

    return (
        <nav className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-100 dark:border-slate-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Parichay
                            </span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium flex gap-2 items-center transition-colors"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    Dashboard
                                </Link>
                                {isAdmin && (
                                    <Link
                                        href="/admin"
                                        className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium flex gap-2 items-center transition-colors"
                                    >
                                        <Settings className="w-4 h-4" />
                                        Admin
                                    </Link>
                                )}
                                <div className="border-l h-6 border-gray-300 dark:border-gray-700 mx-2" />
                                <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <UserIcon className="w-4 h-4" /> {user.email}
                                </span>
                                <button
                                    onClick={logout}
                                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 px-3 py-2 rounded-md text-sm font-medium flex gap-2 items-center transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                        <div className="border-l h-6 border-gray-300 dark:border-gray-700 mx-1" />
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </nav>
    );
}
