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

    const getIcon = (iconName: string, active: boolean) => {
        const iconClasses = `w-5 h-5 transition-colors ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'}`;
        switch (iconName) {
            case 'Home': return <Home className={iconClasses} />;
            case 'User': return <User className={iconClasses} />;
            case 'Settings': return <Settings className={iconClasses} />;
            case 'CreditCard': return <CreditCard className={iconClasses} />;
            default: return <User className={iconClasses} />;
        }
    };


    return (
        <div className="flex min-h-[calc(100vh-80px)]">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800/50 transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
                <div className="h-full flex flex-col">
                    {/* Header in sidebar for mobile */}
                    <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800/50 md:hidden">
                        <span className="text-xl font-black text-white tracking-tighter">Parichay<span className="text-indigo-500">.</span></span>
                        <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto py-8 px-4 space-y-8">
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-4">Main Menu</p>
                            <div className="space-y-1.5">
                                {menus.map((menu) => {
                                    const isActiveMenu = pathname === menu.path;
                                    const isExpanded = expandedMenus[menu.id];

                                    return (
                                        <div key={menu.id} className="group/menu">
                                            {menu.path ? (
                                                <Link 
                                                    href={menu.path} 
                                                    className={`flex items-center px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${isActiveMenu ? 'bg-indigo-600 text-white shadow-[0_8px_20px_rgba(79,70,229,0.3)]' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'}`}
                                                >
                                                    <span className={`mr-4 transition-transform duration-500 ${isActiveMenu ? 'scale-110' : 'group-hover/menu:scale-110'}`}>
                                                        {getIcon(menu.icon, isActiveMenu)}
                                                    </span>
                                                    {menu.title}
                                                </Link>
                                            ) : (
                                                <div
                                                    onClick={() => toggleMenu(menu.id)}
                                                    className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold cursor-pointer transition-all duration-300 ${isExpanded ? 'bg-slate-800/80 text-slate-100' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'}`}
                                                >
                                                    <div className="flex items-center">
                                                        <span className="mr-4 transition-transform duration-500">
                                                            {getIcon(menu.icon, isExpanded)}
                                                        </span>
                                                        {menu.title}
                                                    </div>
                                                    {menu.subMenus && menu.subMenus.length > 0 && (
                                                        <ChevronDown className={`w-4 h-4 transition-transform duration-500 ${isExpanded ? 'rotate-180 text-indigo-400' : 'text-slate-600'}`} />
                                                    )}
                                                </div>
                                            )}

                                            {menu.subMenus && menu.subMenus.length > 0 && isExpanded && (
                                                <div className="grid grid-cols-1 gap-1 mt-1.5 ml-8 pl-4 border-l border-slate-800 animate-in slide-in-from-left-2 duration-500">
                                                    {menu.subMenus.map((sub: any) => {
                                                        const isActiveSub = pathname === sub.path;
                                                        return (
                                                            <Link 
                                                                key={sub.id} 
                                                                href={sub.path} 
                                                                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${isActiveSub ? 'text-indigo-400 bg-indigo-500/5' : 'text-slate-500 hover:text-slate-200'}`}
                                                            >
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

                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-4">Support & Tools</p>
                            <div className="grid gap-1 px-2">
                                <button className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-800/50 hover:text-slate-200 transition-all">Report an Issue</button>
                                <button className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-800/50 hover:text-slate-200 transition-all">Documentation</button>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-5 border border-slate-700/50">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Platform Status</p>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-bold text-slate-300">Operational</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-black/90">
                {/* Mobile Header (Hidden on Desktop) */}
                <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800/50 h-16 flex items-center justify-between px-6 md:hidden sticky top-0 z-40">
                    <button onClick={() => setSidebarOpen(true)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                        <MenuIcon className="w-6 h-6" />
                    </button>
                    <span className="text-indigo-600 dark:text-indigo-400 font-black text-lg tracking-tighter">Parichay<span className="text-slate-900 dark:text-white">.</span></span>
                    <div className="w-6" /> {/* Spacer */}
                </header>

                <main className="flex-1 overflow-y-auto">
                    <div className="p-6 md:p-12 xl:p-16 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-500" />
            )}
        </div>
    );

}
