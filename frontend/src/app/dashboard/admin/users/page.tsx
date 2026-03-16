'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { 
    Users, 
    Mail, 
    Shield, 
    Search,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    UserPlus
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    email: string;
    fullName: string;
    roles: string[];
}

export default function AdminUsersPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        if (!authLoading && (!user || !user.roles.includes('ADMIN'))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/admin/users?page=${page}&size=10`);
                if (res.data?.success) {
                    setUsers(res.data.data.content);
                    setTotalPages(res.data.data.totalPages);
                }
            } catch (error) {
                console.error('Failed to fetch users', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [page, user, authLoading]);

    if (authLoading || (user && !user.roles.includes('ADMIN'))) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage system users, roles and access permissions</p>
                </div>
                
                <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-[1.2rem] font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-105 active:scale-95">
                    <UserPlus className="w-5 h-5" />
                    Add New User
                </button>
            </header>

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-100 dark:border-slate-800">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search by name or email..." 
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-slate-800/30">
                                <th className="px-8 py-5 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                <th className="px-8 py-5 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                <th className="px-8 py-5 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Roles</th>
                                <th className="px-8 py-5 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-8 py-6"><div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded"></div></td>
                                        <td className="px-8 py-6"><div className="h-4 w-48 bg-gray-200 dark:bg-slate-700 rounded"></div></td>
                                        <td className="px-8 py-6"><div className="h-6 w-24 bg-gray-200 dark:bg-slate-700 rounded-full"></div></td>
                                        <td className="px-8 py-6"><div className="h-8 w-8 bg-gray-200 dark:bg-slate-700 rounded ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center text-gray-500">No users found.</td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                                    {user.fullName.charAt(0)}
                                                </div>
                                                <span className="font-bold text-gray-900 dark:text-white">{user.fullName}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center text-gray-600 dark:text-gray-300">
                                                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                                {user.email}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-wrap gap-2">
                                                {user.roles.map((role) => (
                                                    <span key={role} className="flex items-center px-3 py-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-gray-200 dark:border-slate-700">
                                                        <Shield className="w-3 h-3 mr-1.5 text-indigo-500" />
                                                        {role}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Showing page <span className="text-gray-900 dark:text-white">{page + 1}</span> of <span className="text-gray-900 dark:text-white">{totalPages || 1}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <button 
                            disabled={page === 0}
                            onClick={() => setPage(page - 1)}
                            className="p-2 rounded-xl border border-gray-100 dark:border-slate-800 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button 
                            disabled={page >= totalPages - 1 || totalPages === 0}
                            onClick={() => setPage(page + 1)}
                            className="p-2 rounded-xl border border-gray-100 dark:border-slate-800 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
