'use client';

import { useEffect, useState, Suspense } from 'react';
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
    FileCheck,
    Clock,
    AlertCircle
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
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
    ACTIVE: number;
    INACTIVE: number;
}

function AdminProfilesContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { showToast } = useToast();
    const { user, loading: authLoading } = useAuth();
    const statusFilter = searchParams.get('status') || 'PENDING';

    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [statuses, setStatuses] = useState<{ id: number, name: string }[]>([]);
    const [availableActions, setAvailableActions] = useState<any[]>([]);
    const [stats, setStats] = useState<ProfileStats | null>(null);
    const [search, setSearch] = useState('');
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, title: string, message: string, action: () => void }>({
        isOpen: false, title: '', message: '', action: () => { }
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

            const res = await api.patch(`/admin/profiles/${profileId}/status`, { statusId: statusObj.id });
            if (res.data?.success) {
                if (statusName !== statusFilter) {
                    setProfiles(prev => prev.filter(p => p.id !== profileId));
                }
                showToast(`Profile ${statusName.toLowerCase()} successfully`, 'success');
                const statsRes = await api.get('/admin/stats');
                if (statsRes.data?.success) setStats(statsRes.data.data);
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to update status', 'error');
        }
    };

    const handleToggleVerification = async (profileId: number, currentVerified: boolean) => {
        try {
            const res = await api.patch(`/admin/profiles/${profileId}/verification`, { verified: !currentVerified });
            if (res.data?.success) {
                setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, verified: !currentVerified } : p));
                showToast(`Profile ${!currentVerified ? 'verified' : 'unverified'} successfully`, 'success');
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to update verification', 'error');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-info-subtle text-info';
            case 'PENDING': return 'bg-warning-subtle text-warning';
            case 'REJECTED': return 'bg-danger-subtle text-danger';
            case 'ACTIVE': return 'bg-success-subtle text-success';
            default: return 'bg-surface-muted text-muted-foreground';
        }
    };

    if (authLoading || (user && !user.roles.includes('ADMIN'))) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
            </div>
        );
    }

    const statCards = [
        { label: 'Pending activation', value: stats?.PENDING || 0, icon: Clock, color: 'text-warning' },
        { label: 'Active members', value: stats?.ACTIVE || 0, icon: TrendingUp, color: 'text-success' },
        { label: 'Inactive', value: stats?.INACTIVE || 0, icon: ShieldAlert, color: 'text-danger' },
    ];

    return (
        <div className="space-y-5">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p className="text-xs text-faint">Admin / <span className="font-medium text-muted-foreground">Review Profiles</span></p>
                    <h1 className="mt-1 text-[21px] font-semibold tracking-tight text-foreground">Review profiles</h1>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">Manage and verify member bio-data submissions.</p>
                </div>

                {/* Status segmented control */}
                <div className="flex w-fit items-center gap-0.5 rounded-lg border border-border bg-surface-muted p-0.5">
                    {['PENDING', 'ACTIVE', 'INACTIVE'].map((s) => (
                        <button
                            key={s}
                            onClick={() => {
                                router.push(`/dashboard/admin/profiles?status=${s}`);
                                setPage(0);
                            }}
                            className={`rounded-md px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${statusFilter === s
                                ? 'bg-surface text-foreground shadow-card'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {s.charAt(0) + s.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {statCards.map((item) => (
                    <div key={item.label} className="rounded-xl border border-border bg-surface p-4 shadow-card">
                        <div className="flex items-center justify-between">
                            <p className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-faint">{item.label}</p>
                            <item.icon className={`h-4 w-4 ${item.color}`} aria-hidden />
                        </div>
                        <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground tabular-nums">{item.value}</p>
                    </div>
                ))}
            </div>

            {/* Table card */}
            <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
                <div className="border-b border-border px-5 py-3.5">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden />
                        <input
                            type="text"
                            placeholder="Search by name or email…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-border-strong bg-surface py-2 pl-9 pr-3 text-[13.5px] text-foreground placeholder:text-faint focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-[13px]">
                        <thead>
                            <tr className="bg-surface-muted">
                                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.07em] text-faint">Member</th>
                                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.07em] text-faint">Details</th>
                                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.07em] text-faint">Contact</th>
                                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.07em] text-faint">Verification</th>
                                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.07em] text-faint">Status</th>
                                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.07em] text-faint">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-5 py-4"><div className="h-9 w-9 rounded-full bg-surface-muted" /></td>
                                        <td className="px-5 py-4"><div className="h-4 w-40 rounded bg-surface-muted" /></td>
                                        <td className="px-5 py-4"><div className="h-4 w-24 rounded bg-surface-muted" /></td>
                                        <td className="px-5 py-4"><div className="h-4 w-20 rounded bg-surface-muted" /></td>
                                        <td className="px-5 py-4"><div className="h-5 w-16 rounded-full bg-surface-muted" /></td>
                                        <td className="px-5 py-4"><div className="ml-auto h-7 w-24 rounded bg-surface-muted" /></td>
                                    </tr>
                                ))
                            ) : profiles.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-16 text-center">
                                        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
                                            <Filter className="h-6 w-6 text-faint" aria-hidden />
                                        </span>
                                        <p className="mt-3 text-[13px] font-medium text-muted-foreground">
                                            No profiles with status "{statusFilter.charAt(0) + statusFilter.slice(1).toLowerCase()}"
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                profiles.map((profile) => (
                                    <tr key={profile.id} className="transition-colors hover:bg-surface-hover">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-muted">
                                                    {profile.photoUrl ? (
                                                        <img
                                                            src={`${IMAGE_BASE_URL}${profile.photoUrl}`}
                                                            alt={profile.fullName}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-[10px] font-semibold text-faint">NA</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="font-semibold text-foreground">{profile.fullName}</p>
                                                        {profile.verified && (
                                                            <ShieldCheck className="h-3.5 w-3.5 text-success" aria-label="Verified member" />
                                                        )}
                                                    </div>
                                                    <p className="text-[12px] text-faint tabular-nums">ID #{profile.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="space-y-1 text-[12.5px] text-muted-foreground">
                                                <p className="flex items-center gap-1.5">
                                                    <MapPin className="h-3.5 w-3.5 text-faint" aria-hidden /> {profile.familyCity || '—'}
                                                </p>
                                                <p className="flex items-center gap-1.5">
                                                    <Briefcase className="h-3.5 w-3.5 text-faint" aria-hidden /> {profile.occupation || '—'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <p className="font-medium text-foreground tabular-nums">{profile.contactNumber}</p>
                                            <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-faint">
                                                <Calendar className="h-3 w-3" aria-hidden /> {new Date(profile.dob).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${profile.verified ? 'bg-success-subtle text-success' : 'bg-surface-muted text-muted-foreground'}`}>
                                                <ShieldCheck className="h-3 w-3" aria-hidden />
                                                {profile.verified ? 'Verified' : 'Unverified'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${getStatusBadge(profile.membershipStatus.name)}`}>
                                                {profile.membershipStatus.name.charAt(0) + profile.membershipStatus.name.slice(1).toLowerCase()}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {availableActions.map((action) => (
                                                    <button
                                                        key={action.code}
                                                        onClick={() => {
                                                            if (action.code === 'VIEW') {
                                                                router.push(`/dashboard/admin/profiles/${profile.id}`);
                                                            } else {
                                                                setConfirmModal({
                                                                    isOpen: true,
                                                                    title: `Confirm ${action.label.toLowerCase()}`,
                                                                    message: `Are you sure you want to ${action.label.toLowerCase()} this profile?`,
                                                                    action: () => {
                                                                        handleStatusUpdate(profile.id, (action.code === 'ACTIVATE' || action.code === 'REACTIVATE') ? 'ACTIVE' : 'INACTIVE');
                                                                        setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                                                    }
                                                                });
                                                            }
                                                        }}
                                                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${action.code === 'REJECT' || action.code === 'DEACTIVATE'
                                                            ? 'text-danger hover:bg-danger-subtle'
                                                            : action.code === 'APPROVE' || action.code === 'ACTIVATE' || action.code === 'REACTIVATE'
                                                                ? 'text-success hover:bg-success-subtle'
                                                                : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground'}`}
                                                        title={action.label}
                                                        aria-label={`${action.label} ${profile.fullName}`}
                                                    >
                                                        {action.code === 'VIEW' && <Eye className="h-4 w-4" aria-hidden />}
                                                        {action.code === 'APPROVE' && <Check className="h-4 w-4" aria-hidden />}
                                                        {action.code === 'REJECT' && <X className="h-4 w-4" aria-hidden />}
                                                        {action.code === 'ACTIVATE' && <Check className="h-4 w-4" aria-hidden />}
                                                        {action.code === 'REACTIVATE' && <Check className="h-4 w-4" aria-hidden />}
                                                        {action.code === 'DEACTIVATE' && <X className="h-4 w-4" aria-hidden />}
                                                        {['VIEW', 'APPROVE', 'REJECT', 'ACTIVATE', 'DEACTIVATE', 'REACTIVATE'].indexOf(action.code) === -1 && <span className="text-xs">{action.label}</span>}
                                                    </button>
                                                ))}

                                                <button
                                                    onClick={() => handleToggleVerification(profile.id, profile.verified)}
                                                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${profile.verified ? 'text-success hover:bg-success-subtle' : 'text-faint hover:bg-surface-muted hover:text-foreground'}`}
                                                    title={profile.verified ? 'Revoke verification' : 'Verify profile'}
                                                    aria-label={`${profile.verified ? 'Revoke verification for' : 'Verify'} ${profile.fullName}`}
                                                >
                                                    {profile.verified ? <ShieldCheck className="h-4 w-4" aria-hidden /> : <ShieldAlert className="h-4 w-4" aria-hidden />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between border-t border-border px-5 py-3">
                    <p className="text-[12.5px] text-muted-foreground tabular-nums">
                        Page {page + 1} of {totalPages || 1}
                    </p>
                    <div className="flex items-center gap-1.5">
                        <button
                            disabled={page === 0}
                            onClick={() => setPage(page - 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-strong text-muted-foreground transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Previous page"
                        >
                            <ChevronLeft className="h-4 w-4" aria-hidden />
                        </button>
                        <button
                            disabled={page >= totalPages - 1 || totalPages === 0}
                            onClick={() => setPage(page + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-strong text-muted-foreground transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Next page"
                        >
                            <ChevronRight className="h-4 w-4" aria-hidden />
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
                            className="rounded-lg px-3.5 py-2 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => confirmModal.action()}
                            className="rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover"
                        >
                            Confirm
                        </button>
                    </>
                }
            >
                <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warning-subtle">
                        <AlertCircle className="h-4.5 w-4.5 text-warning" aria-hidden />
                    </span>
                    <p className="text-[13.5px] text-muted-foreground">{confirmModal.message}</p>
                </div>
            </Modal>
        </div>
    );
}

export default function AdminProfilesPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
            </div>
        }>
            <AdminProfilesContent />
        </Suspense>
    );
}
