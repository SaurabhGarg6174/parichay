'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Settings, Menu as MenuIcon, X, ChevronDown, CreditCard, LifeBuoy } from 'lucide-react';
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
        const iconClasses = 'w-4 h-4 shrink-0';
        switch (iconName) {
            case 'Home': return <Home className={iconClasses} aria-hidden />;
            case 'User': return <User className={iconClasses} aria-hidden />;
            case 'Settings': return <Settings className={iconClasses} aria-hidden />;
            case 'CreditCard': return <CreditCard className={iconClasses} aria-hidden />;
            default: return <User className={iconClasses} aria-hidden />;
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-3.5rem)]">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-60 border-r border-border bg-surface transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
                <div className="flex h-full flex-col">
                    {/* Mobile close row */}
                    <div className="flex h-14 items-center justify-between border-b border-border px-4 md:hidden">
                        <span className="text-[15px] font-semibold tracking-tight text-foreground">Parichay</span>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                            aria-label="Close sidebar"
                        >
                            <X className="h-4 w-4" aria-hidden />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 py-5">
                        <p className="px-2.5 pb-2 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-faint">Menu</p>
                        <nav className="flex flex-col gap-0.5">
                            {menus.map((menu) => {
                                const isActiveMenu = pathname === menu.path;
                                const isExpanded = expandedMenus[menu.id];

                                return (
                                    <div key={menu.id}>
                                        {menu.path ? (
                                            <Link
                                                href={menu.path}
                                                onClick={() => setSidebarOpen(false)}
                                                className={`relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors ${isActiveMenu
                                                    ? 'bg-primary-subtle font-semibold text-primary before:absolute before:-left-3 before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-r before:bg-primary'
                                                    : 'font-medium text-muted-foreground hover:bg-surface-hover hover:text-foreground'}`}
                                            >
                                                {getIcon(menu.icon)}
                                                {menu.title}
                                            </Link>
                                        ) : (
                                            <button
                                                onClick={() => toggleMenu(menu.id)}
                                                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[13px] transition-colors ${isExpanded ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground hover:bg-surface-hover hover:text-foreground'}`}
                                            >
                                                <span className="flex items-center gap-2.5">
                                                    {getIcon(menu.icon)}
                                                    {menu.title}
                                                </span>
                                                {menu.subMenus && menu.subMenus.length > 0 && (
                                                    <ChevronDown className={`h-3.5 w-3.5 text-faint transition-transform ${isExpanded ? 'rotate-180' : ''}`} aria-hidden />
                                                )}
                                            </button>
                                        )}

                                        {menu.subMenus && menu.subMenus.length > 0 && isExpanded && (
                                            <div className="mt-0.5 ml-4 flex flex-col gap-0.5 border-l border-border pl-3">
                                                {menu.subMenus.map((sub: any) => {
                                                    const isActiveSub = pathname === sub.path;
                                                    return (
                                                        <Link
                                                            key={sub.id}
                                                            href={sub.path}
                                                            onClick={() => setSidebarOpen(false)}
                                                            className={`rounded-lg px-2.5 py-1.5 text-[12.5px] transition-colors ${isActiveSub
                                                                ? 'bg-primary-subtle font-semibold text-primary'
                                                                : 'font-medium text-muted-foreground hover:bg-surface-hover hover:text-foreground'}`}
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
                        </nav>

                        <p className="px-2.5 pb-2 pt-6 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-faint">Support</p>
                        <nav className="flex flex-col gap-0.5">
                            <button className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground">
                                <LifeBuoy className="h-4 w-4 shrink-0" aria-hidden />
                                Help &amp; Support
                            </button>
                        </nav>
                    </div>

                    <div className="border-t border-border p-3">
                        <div className="rounded-[10px] border border-border bg-surface-muted px-3 py-2.5">
                            <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                                <span className="text-xs font-medium text-muted-foreground">All systems operational</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex min-w-0 flex-1 flex-col bg-background">
                {/* Mobile header */}
                <header className="sticky top-0 z-40 flex h-12 items-center border-b border-border bg-surface px-4 md:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                        aria-label="Open sidebar"
                    >
                        <MenuIcon className="h-5 w-5" aria-hidden />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto w-full max-w-[1120px] px-4 py-6 sm:px-6 md:px-8 md:py-8">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/30 md:hidden" />
            )}
        </div>
    );
}
