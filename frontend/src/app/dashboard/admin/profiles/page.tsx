'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { 
    Check, 
    X, 
    Eye, 
    Search, 
    Filter,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Calendar,
    Briefcase
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';

interface Profile {
    id: number;
    fullName: string;
    photoUrl: string;
    gender: string;
    dob: string;
    familyCity: string;
    occupation: string;
    membershipStatus: {
        id: number;
        name: string;
    };
}

export default function AdminProfilesPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const statusFilter = searchParams.get('status') || 'PENDING';
    
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [statuses, setStatuses] = useState<{id: number, name: string}[]>([]);
    const [availableActions, setAvailableActions] = useState<any[]>([]);

    useEffect(() => {
        if (!authLoading && (!user || !user.roles.includes('ADMIN'))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        const fetchStatuses = async () => {
            try {
                const res = await api.get('/metadata/statuses');
                if (res.data?.success) {
                    setStatuses(res.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch statuses', error);
            }
        };
        fetchStatuses();
    }, []);

    useEffect(() => {
        const fetchProfiles = async () => {
            setLoading(true);
            try {
                // Find status ID for the filter name
                const statusObj = statuses.find(s => s.name === statusFilter);
                if (statusObj || statuses.length > 0) {
                    const statusId = statusObj?.id || (statusFilter === 'PENDING' ? 1 : 4); // Fallback
                    const res = await api.get(`/admin/profiles?statusId=${statusId}&page=${page}&size=10`);
                    if (res.data?.success) {
                        setProfiles(res.data.data.content);
                        setTotalPages(res.data.data.totalPages);
                        setAvailableActions(res.data.data.actions || []);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch profiles', error);
            } finally {
                setLoading(false);
            }
        };

        if (statuses.length > 0) {
            fetchProfiles();
        }
    }, [statusFilter, page, statuses]);

    const handleStatusUpdate = async (profileId: number, statusName: string) => {
        try {
            const statusObj = statuses.find(s => s.name === statusName);
            if (!statusObj) return;

            const res = await api.put(`/admin/profiles/${profileId}/status/${statusObj.id}`);
            if (res.data?.success) {
                // Remove from list or update
                setProfiles(prev => prev.filter(p => p.id !== profileId));
            }
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
            case 'PENDING': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
            case 'REJECTED': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400';
            case 'ACTIVE': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-400';
        }
    };
    
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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Review Profiles</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and verify member bio-data submissions</p>
                </div>
                
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    {['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE'].map((s) => (
                        <button
                            key={s}
                            onClick={() => {
                                router.push(`/dashboard/admin/profiles?status=${s}`);
                                setPage(0);
                            }}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                statusFilter === s 
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none' 
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                            }`}
                        >
                            {s.charAt(0) + s.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </header>

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search by name or ID..." 
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-slate-800/30">
                                <th className="px-8 py-5 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Member</th>
                                <th className="px-8 py-5 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</th>
                                <th className="px-8 py-5 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-8 py-5 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-8 py-6"><div className="h-12 w-12 bg-gray-200 dark:bg-slate-700 rounded-full"></div></td>
                                        <td className="px-8 py-6"><div className="h-4 w-48 bg-gray-200 dark:bg-slate-700 rounded"></div></td>
                                        <td className="px-8 py-6"><div className="h-6 w-20 bg-gray-200 dark:bg-slate-700 rounded-full"></div></td>
                                        <td className="px-8 py-6"><div className="h-8 w-24 bg-gray-200 dark:bg-slate-700 rounded ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : profiles.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <Filter className="w-12 h-12 text-gray-300 mb-4" />
                                            <p className="text-gray-500 dark:text-gray-400 font-medium">No profiles found with status "{statusFilter}"</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                profiles.map((profile) => (
                                    <tr key={profile.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm">
                                                    <Image 
                                                        src={profile.photoUrl || '/placeholder-user.png'} 
                                                        alt={profile.fullName}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white">{profile.fullName}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">ID: #{profile.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                                                    <MapPin className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                                    {profile.familyCity}
                                                </div>
                                                <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                                                    <Briefcase className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                                    {profile.occupation}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${getStatusColor(profile.membershipStatus.name)}`}>
                                                {profile.membershipStatus.name}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {availableActions.map((action) => (
                                                    <button 
                                                        key={action.code}
                                                        onClick={() => {
                                                            if (action.code === 'VIEW') {
                                                                router.push(`/dashboard/admin/profiles/${profile.id}`);
                                                            } else if (action.code === 'APPROVE') {
                                                                handleStatusUpdate(profile.id, 'APPROVED');
                                                            } else if (action.code === 'REJECT') {
                                                                handleStatusUpdate(profile.id, 'REJECTED');
                                                            } else if (action.code === 'ACTIVATE') {
                                                                handleStatusUpdate(profile.id, 'ACTIVE');
                                                            }
                                                        }}
                                                        className={`p-2 transition-all rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 ${action.color || 'text-gray-500'}`}
                                                        title={action.label}
                                                    >
                                                        {action.code === 'VIEW' && <Eye className="w-5 h-5" />}
                                                        {action.code === 'APPROVE' && <Check className="w-5 h-5" />}
                                                        {action.code === 'REJECT' && <X className="w-5 h-5" />}
                                                        {action.code === 'ACTIVATE' && <Check className="w-5 h-5" />}
                                                        {/* Fallback code-based icons if needed */}
                                                        {['VIEW', 'APPROVE', 'REJECT', 'ACTIVATE'].indexOf(action.code) === -1 && <span>{action.label}</span>}
                                                    </button>
                                                ))}
                                            </div>
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
