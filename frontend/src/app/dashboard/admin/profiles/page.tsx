'use client';

import { useEffect, useState } from 'react';
import api, { IMAGE_BASE_URL } from '@/lib/api';
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
    Briefcase,
    ShieldCheck,
    ShieldAlert,
    TrendingUp,
    FileCheck
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Modal from '@/components/Modal';
import { useToast } from '@/context/ToastContext';

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
    verified: boolean;
    contactNumber: string;
}

interface ProfileStats {
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
    ACTIVE: number;
}

export default function AdminProfilesPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { showToast } = useToast();
    const { user, loading: authLoading } = useAuth();
    const statusFilter = searchParams.get('status') || 'PENDING';
    
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [statuses, setStatuses] = useState<{id: number, name: string}[]>([]);
    const [availableActions, setAvailableActions] = useState<any[]>([]);
    const [stats, setStats] = useState<ProfileStats | null>(null);
    const [search, setSearch] = useState('');
    const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, action: () => void}>({
        isOpen: false, title: '', message: '', action: () => {}
    });

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
                const statsRes = await api.get('/admin/stats');
                if (statsRes.data?.success) {
                    setStats(statsRes.data.data);
                }
            } catch (error: any) {
                showToast(error.response?.data?.message || 'Failed to fetch metadata', 'error');
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
                    const res = await api.get(`/admin/profiles?statusId=${statusId}&page=${page}&size=10${search ? `&search=${search}` : ''}`);
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
    }, [statusFilter, page, search, statuses]);

    const handleStatusUpdate = async (profileId: number, statusName: string) => {
        try {
            const statusObj = statuses.find(s => s.name === statusName);
            if (!statusObj) return;

            const res = await api.put(`/admin/profiles/${profileId}/status/${statusObj.id}`);
            if (res.data?.success) {
                // Remove from list if status changed
                if (statusName !== statusFilter) {
                    setProfiles(prev => prev.filter(p => p.id !== profileId));
                }
                showToast(`Profile ${statusName.toLowerCase()} successfully`, 'success');
                // Refresh stats
                const statsRes = await api.get('/admin/stats');
                if (statsRes.data?.success) setStats(statsRes.data.data);
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to update status', 'error');
        }
    };

    const handleToggleVerification = async (profileId: number, currentVerified: boolean) => {
        try {
            const res = await api.put(`/admin/profiles/${profileId}/verify/${!currentVerified}`);
            if (res.data?.success) {
                setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, verified: !currentVerified } : p));
                showToast(`Profile ${!currentVerified ? 'verified' : 'unverified'} successfully`, 'success');
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to update verification', 'error');
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
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Pending Review', value: stats?.PENDING || 0, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Active Members', value: stats?.ACTIVE || 0, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Approved', value: stats?.APPROVED || 0, icon: FileCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Rejected', value: stats?.REJECTED || 0, icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50' },
                ].map((item, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className={`p-4 rounded-2xl ${item.bg} ${item.color}`}>
                            <item.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>

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
                            placeholder="Search by name or email..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
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
                                <th className="px-8 py-5 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                                <th className="px-8 py-5 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Verified Status</th>
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
                                        <td className="px-8 py-6"><div className="h-6 w-20 bg-gray-200 dark:bg-slate-700 rounded-full"></div></td> {/* Added for new column */}
                                        <td className="px-8 py-6"><div className="h-6 w-20 bg-gray-200 dark:bg-slate-700 rounded-full"></div></td> {/* Added for new column */}
                                        <td className="px-8 py-6"><div className="h-8 w-24 bg-gray-200 dark:bg-slate-700 rounded ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : profiles.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center"> {/* Updated colspan */}
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
                                                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm bg-gray-100 flex items-center justify-center">
                                                    {profile.photoUrl ? (
                                                        <img 
                                                            src={`${IMAGE_BASE_URL}${profile.photoUrl}`} 
                                                            alt={profile.fullName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-400">NA</span>
                                                    )}
                                                </div>
                                                 <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-gray-900 dark:text-white">{profile.fullName}</p>
                                                        {profile.verified && (
                                                            <div title="Verified Member">
                                                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                                            </div>
                                                        )}
                                                    </div>
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
                                            <div className="flex flex-col gap-1.5 border-l-2 border-gray-100 dark:border-slate-800 pl-4">
                                                <div className="flex items-center gap-2 text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter">
                                                    {profile.contactNumber}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(profile.dob).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                                                    {profile.verified ? 'Verified' : 'Unverified'}
                                                </p>
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500">Contact verified via ID Proof</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${getStatusColor(profile.membershipStatus.name)}`}>
                                                {profile.membershipStatus.name}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">


                                                {availableActions.map((action) => (
                                                    <button 
                                                        key={action.code}
                                                        onClick={() => {
                                                            if (action.code === 'VIEW') {
                                                                router.push(`/dashboard/admin/profiles/${profile.id}`);
                                                            } else {
                                                                setConfirmModal({
                                                                    isOpen: true,
                                                                    title: `Confirm ${action.label}`,
                                                                    message: `Are you sure you want to ${action.label.toLowerCase()} this profile?`,
                                                                    action: () => {
                                                                        handleStatusUpdate(profile.id, action.code === 'ACTIVATE' ? 'ACTIVE' : action.code === 'APPROVE' ? 'APPROVED' : 'REJECTED');
                                                                        setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                                                    }
                                                                });
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

                                                <button 
                                                    onClick={() => handleToggleVerification(profile.id, profile.verified)}
                                                    className={`p-2 transition-all rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 ${profile.verified ? 'text-emerald-600' : 'text-gray-400'}`}
                                                    title={profile.verified ? 'Revoke Verification' : 'Verify Profile'}
                                                >
                                                    {profile.verified ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                                                </button>
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

            <Modal 
                isOpen={confirmModal.isOpen} 
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                title={confirmModal.title}
                footer={
                    <>
                        <button 
                            onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                            className="px-6 py-2.5 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => confirmModal.action()}
                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-105"
                        >
                            Confirm
                        </button>
                    </>
                }
            >
                <div className="flex items-start gap-4 text-gray-600 dark:text-gray-300">
                    <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-600">
                        <Check className="w-6 h-6" />
                    </div>
                    <div>
                        <p>{confirmModal.message}</p>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
