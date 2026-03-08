'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Settings, Menu as MenuIcon, X, ChevronDown, ChevronUp, CreditCard } from 'lucide-react';
import api from '@/lib/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [menus, setMenus] = useState<any[]>([]);
    const [expandedMenus, setExpandedMenus] = useState<Record<number, boolean>>({});
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const fetchMenus = async () => {
            try {
                const res = await api.get('/menus');
                if (res.data?.data) {
                    setMenus(res.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch menus', error);
            }
        };
        fetchMenus();
    }, []);

    useEffect(() => {
        if (menus.length > 0) {
            const initialExpanded: Record<number, boolean> = {};
            menus.forEach(menu => {
                if (menu.subMenus && menu.subMenus.some((sub: any) => pathname.startsWith(sub.path))) {
                    initialExpanded[menu.id] = true;
                }
            });
            setExpandedMenus(prev => ({ ...prev, ...initialExpanded }));
        }
    }, [menus, pathname]);

    const toggleMenu = (id: number) => {
        setExpandedMenus(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'Home': return <Home className="w-5 h-5 text-gray-500" />;
            case 'User': return <User className="w-5 h-5 text-gray-500" />;
            case 'Settings': return <Settings className="w-5 h-5 text-gray-500" />;
            case 'CreditCard': return <CreditCard className="w-5 h-5 text-gray-500" />;
            default: return <User className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
                <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-slate-800 md:hidden">
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Logo</span>
                        <button onClick={() => setSidebarOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pt-4 pb-4 px-3 space-y-1">
                        {menus.map((menu) => {
                            const isActiveMenu = pathname === menu.path;
                            const isExpanded = expandedMenus[menu.id];

                            return (
                                <div key={menu.id} className="mb-2">
                                    {menu.path ? (
                                        <Link href={menu.path} className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActiveMenu ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                                            <span className="mr-3">{getIcon(menu.icon)}</span>
                                            {menu.title}
                                        </Link>
                                    ) : (
                                        <div
                                            onClick={() => toggleMenu(menu.id)}
                                            className="px-3 py-2.5 flex items-center justify-between text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                        >
                                            <div className="flex items-center uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                <span className="mr-3">{getIcon(menu.icon)}</span>
                                                {menu.title}
                                            </div>
                                            {menu.subMenus && menu.subMenus.length > 0 && (
                                                isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                            )}
                                        </div>
                                    )}

                                    {menu.subMenus && menu.subMenus.length > 0 && isExpanded && (
                                        <div className="ml-8 mt-1 space-y-1">
                                            {menu.subMenus.map((sub: any) => {
                                                const isActiveSub = pathname === sub.path;
                                                return (
                                                    <Link key={sub.id} href={sub.path} className={`flex px-3 py-2 rounded-lg text-sm transition-colors ${isActiveSub ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-200'}`}>
                                                        {sub.title}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-slate-950">
                {/* Mobile Header */}
                <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 h-16 flex items-center justify-between px-4 md:hidden">
                    <button onClick={() => setSidebarOpen(true)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mr-4">
                        <MenuIcon className="w-6 h-6" />
                    </button>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">Dashboard</span>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/20 z-40 md:hidden" />
            )}
        </div>
    );
}
