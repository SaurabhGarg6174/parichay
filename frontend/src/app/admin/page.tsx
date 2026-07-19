'use client';

import { useEffect, useState } from 'react';
import api, { IMAGE_BASE_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
    CheckCircle, XCircle, Clock, Users, ShieldCheck, Ban,
    Zap, ChevronDown, ChevronUp, User as UserIcon, Eye
} from 'lucide-react';

interface ProfileStats {
    PENDING: number;
    ACTIVE: number;
    INACTIVE: number;
}

export default function AdminDashboard() {
    const { user } = useAuth();
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<ProfileStats | null>(null);
    const [expandedProfileId, setExpandedProfileId] = useState<number | null>(null);
    const [expandedProfile, setExpandedProfile] = useState<any>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [statuses, setStatuses] = useState<any[]>([]);
    const [statusId, setStatusId] = useState<number | null>(null);

    useEffect(() => {
        if (user?.roles?.includes('ADMIN')) {
            fetchStatuses();
            fetchStats();
        }
    }, [user]);

    useEffect(() => {
        if (statusId) {
            fetchProfiles();
        }
    }, [statusId]);

    const fetchStatuses = async () => {
        try {
            const res = await api.get('/metadata/statuses');
            if (res.data?.data) {
                const s = res.data.data;
                setStatuses(s);
                const pending = s.find((x: any) => x.name === 'PENDING');
                if (pending) setStatusId(pending.id);
            }
        } catch (err) {
            console.error("Failed to load statuses", err);
        }
    };

    const fetchProfiles = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/admin/profiles?statusId=${statusId}&page=0&size=50`);
            setProfiles(data.data.content);
        } catch (err) {
            console.error("Failed to load profiles", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/admin/stats');
            if (data?.data) {
                setStats(data.data);
            }
        } catch (err) {
            console.error("Failed to load stats", err);
        }
    };

    const updateStatus = async (profileId: number, newStatusId: number) => {
        try {
            await api.patch(`/admin/profiles/${profileId}/status`, { statusId: newStatusId });
            fetchProfiles();
            fetchStats();
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const toggleProfileDetail = async (profileId: number) => {
        if (expandedProfileId === profileId) {
            setExpandedProfileId(null);
            setExpandedProfile(null);
            return;
        }

        setExpandedProfileId(profileId);
        setLoadingDetail(true);
        try {
            const { data } = await api.get(`/admin/profiles/${profileId}`);
            if (data?.data) {
                setExpandedProfile(data.data);
            }
        } catch (err) {
            console.error("Failed to load profile detail", err);
        } finally {
            setLoadingDetail(false);
        }
    };

    const getStatusId = (name: string) => statuses.find(s => s.name === name)?.id;

    const statCards = [
        { key: 'PENDING', label: 'Pending activation', icon: Clock, color: 'text-warning' },
        { key: 'ACTIVE', label: 'Active members', icon: Zap, color: 'text-success' },
        { key: 'INACTIVE', label: 'Inactive', icon: Ban, color: 'text-danger' },
    ];

    const FieldView = ({ label, value }: { label: string; value: any }) => (
        <div>
            <p className="text-[11.5px] text-faint">{label}</p>
            <p className="mt-0.5 text-[13px] font-medium text-foreground">
                {value || <span className="font-normal text-faint">Not specified</span>}
            </p>
        </div>
    );

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
            <header className="mb-6">
                <h1 className="text-[21px] font-semibold tracking-tight text-foreground">Admin dashboard</h1>
                <p className="mt-0.5 text-[13px] text-muted-foreground">Review submissions and manage member profiles.</p>
            </header>

            {/* Stats — click to filter the table */}
            {stats && (
                <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {statCards.map(card => {
                        const Icon = card.icon;
                        const count = stats[card.key as keyof ProfileStats] || 0;
                        const currentCardStatusId = getStatusId(card.key);
                        const isSelected = statusId === currentCardStatusId;

                        return (
                            <button
                                key={card.key}
                                onClick={() => currentCardStatusId && setStatusId(currentCardStatusId)}
                                className={`rounded-xl border bg-surface p-4 text-left shadow-card transition-all hover:border-border-strong ${isSelected ? 'border-primary ring-1 ring-primary' : 'border-border'}`}
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-faint">{card.label}</p>
                                    <Icon className={`h-4 w-4 ${card.color}`} aria-hidden />
                                </div>
                                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground tabular-nums">{count}</p>
                                {isSelected && <p className="mt-1 text-[11.5px] font-semibold text-primary">Showing below</p>}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Profiles table */}
            <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
                <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Users className="h-4 w-4 text-muted-foreground" aria-hidden />
                        {statCards.find(c => getStatusId(c.key) === statusId)?.label} profiles
                    </h2>
                    <span className="text-[12.5px] text-muted-foreground tabular-nums">{profiles.length} profiles</span>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
                        <p className="mt-3 text-[13px] text-muted-foreground">Loading profiles…</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-[13px]">
                            <thead className="bg-surface-muted">
                                <tr>
                                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.07em] text-faint">ID</th>
                                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.07em] text-faint">Name</th>
                                    <th className="hidden px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.07em] text-faint md:table-cell">Gotra</th>
                                    <th className="hidden px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.07em] text-faint lg:table-cell">Contact</th>
                                    <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.07em] text-faint">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {profiles.map(p => (
                                    <>
                                        <tr key={p.id} className="transition-colors hover:bg-surface-hover">
                                            <td className="whitespace-nowrap px-5 py-3 text-muted-foreground tabular-nums">#{p.id}</td>
                                            <td className="whitespace-nowrap px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-muted">
                                                        {p.photoUrl ? (
                                                            <img src={`${IMAGE_BASE_URL}${p.photoUrl}`} alt={p.fullName} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <UserIcon className="h-4 w-4 text-faint" aria-hidden />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-foreground">{p.fullName}</p>
                                                        <p className="text-[12px] text-faint">{p.gender} · {p.maritalStatus || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="hidden whitespace-nowrap px-5 py-3 text-muted-foreground md:table-cell">{p.gotra}</td>
                                            <td className="hidden whitespace-nowrap px-5 py-3 text-muted-foreground tabular-nums lg:table-cell">{p.contactNumber}</td>
                                            <td className="whitespace-nowrap px-5 py-3">
                                                <div className="flex justify-end gap-1.5">
                                                    <button
                                                        onClick={() => toggleProfileDetail(p.id)}
                                                        className="flex items-center gap-1 rounded-lg border border-border-strong bg-surface px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-surface-hover"
                                                        aria-label={`${expandedProfileId === p.id ? 'Hide' : 'Show'} details for ${p.fullName}`}
                                                    >
                                                        <Eye className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                                                        {expandedProfileId === p.id ? <ChevronUp className="h-3 w-3" aria-hidden /> : <ChevronDown className="h-3 w-3" aria-hidden />}
                                                    </button>
                                                    {(statusId === getStatusId('PENDING') || statusId === getStatusId('INACTIVE')) && (
                                                        <button
                                                            onClick={() => {
                                                                const id = getStatusId('ACTIVE');
                                                                if (id) updateStatus(p.id, id);
                                                            }}
                                                            className="flex items-center gap-1 rounded-lg border border-border-strong bg-surface px-2.5 py-1.5 text-xs font-semibold text-success transition-colors hover:bg-success-subtle"
                                                            title="Activate"
                                                        >
                                                            <CheckCircle className="h-3.5 w-3.5" aria-hidden /> <span className="hidden sm:inline">Activate</span>
                                                        </button>
                                                    )}
                                                    {statusId === getStatusId('ACTIVE') && (
                                                        <button
                                                            onClick={() => {
                                                                const id = getStatusId('INACTIVE');
                                                                if (id) updateStatus(p.id, id);
                                                            }}
                                                            className="flex items-center gap-1 rounded-lg border border-border-strong bg-surface px-2.5 py-1.5 text-xs font-semibold text-danger transition-colors hover:bg-danger-subtle"
                                                            title="Deactivate"
                                                        >
                                                            <XCircle className="h-3.5 w-3.5" aria-hidden /> <span className="hidden sm:inline">Deactivate</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Expanded detail */}
                                        {expandedProfileId === p.id && (
                                            <tr key={`detail-${p.id}`}>
                                                <td colSpan={5} className="bg-surface-muted px-5 py-5">
                                                    {loadingDetail ? (
                                                        <div className="py-4 text-center">
                                                            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
                                                        </div>
                                                    ) : expandedProfile ? (
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface">
                                                                    {expandedProfile.photoUrl ? (
                                                                        <img src={`${IMAGE_BASE_URL}${expandedProfile.photoUrl}`} alt={expandedProfile.fullName} className="h-full w-full object-cover" />
                                                                    ) : (
                                                                        <UserIcon className="h-6 w-6 text-faint" aria-hidden />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <h3 className="text-[15px] font-semibold text-foreground">{expandedProfile.fullName}</h3>
                                                                    <p className="text-[12.5px] text-muted-foreground">
                                                                        {expandedProfile.gender} · {expandedProfile.maritalStatus} · Gotra: {expandedProfile.gotra}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-[10px] border border-border bg-surface p-4 md:grid-cols-4">
                                                                <FieldView label="Contact" value={expandedProfile.contactNumber} />
                                                                <FieldView label="Date of birth" value={expandedProfile.dob} />
                                                                <FieldView label="Birth time" value={expandedProfile.birthTime} />
                                                                <FieldView label="Birth place" value={expandedProfile.birthPlace} />
                                                                <FieldView label="Height" value={expandedProfile.height} />
                                                                <FieldView label="Weight" value={expandedProfile.weight} />
                                                                <FieldView label="Complexion" value={expandedProfile.complexion} />
                                                                <FieldView label="Manglik" value={expandedProfile.isManglik} />
                                                                <FieldView label="Education" value={expandedProfile.education} />
                                                                <FieldView label="Occupation" value={expandedProfile.occupation} />
                                                                <FieldView label="Monthly income" value={expandedProfile.monthlyIncome ? `₹${expandedProfile.monthlyIncome}` : null} />
                                                                <FieldView label="Spectacles" value={expandedProfile.wearsSpectacles ? 'Yes' : 'No'} />
                                                                <FieldView label="Father's name" value={expandedProfile.fatherName} />
                                                                <FieldView label="Father's occupation" value={expandedProfile.fatherOccupation} />
                                                                <FieldView label="Mother's name" value={expandedProfile.motherName} />
                                                                <FieldView label="Mother's occupation" value={expandedProfile.motherOccupation} />
                                                                <FieldView label="Brothers (M/U)" value={`${expandedProfile.brothersMarried || 0} / ${expandedProfile.brothersUnmarried || 0}`} />
                                                                <FieldView label="Sisters (M/U)" value={`${expandedProfile.sistersMarried || 0} / ${expandedProfile.sistersUnmarried || 0}`} />
                                                                <FieldView label="City" value={expandedProfile.familyCity} />
                                                                <FieldView label="Address" value={`${expandedProfile.familyAddress || ''}, ${expandedProfile.familyCity || ''}, ${expandedProfile.familyState || ''}`.replace(/^[,\s]+|[,\s]+$/g, '').replace(/,\s*,/g, ',')} />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-center text-[13px] text-muted-foreground">Failed to load profile details.</p>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))}
                                {profiles.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-14 text-center">
                                            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
                                                <Users className="h-6 w-6 text-faint" aria-hidden />
                                            </span>
                                            <p className="mt-3 text-[13px] font-medium text-muted-foreground">No profiles in this status.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
