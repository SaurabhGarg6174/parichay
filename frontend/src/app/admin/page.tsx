'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
    CheckCircle, XCircle, Clock, Users, ShieldCheck, Ban,
    Zap, ChevronDown, ChevronUp, MapPin, Calendar, GraduationCap,
    Briefcase, User as UserIcon, Eye
} from 'lucide-react';

interface ProfileStats {
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
    ACTIVE: number;
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
        { key: 'PENDING', label: 'Pending Review', icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-100 dark:border-amber-900/30' },
        { key: 'APPROVED', label: 'Approved', icon: ShieldCheck, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-100 dark:border-blue-900/30' },
        { key: 'ACTIVE', label: 'Active Members', icon: Zap, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-100 dark:border-green-900/30' },
        { key: 'REJECTED', label: 'Rejected', icon: Ban, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-100 dark:border-red-900/30' },
    ];

    const FieldView = ({ label, value }: { label: string; value: any }) => (
        <div className="bg-gray-50/50 dark:bg-slate-800/50 p-3 rounded-lg border border-gray-100/50 dark:border-slate-700/50">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
            <p className="text-sm text-gray-900 dark:text-gray-100 font-semibold">{value || <span className="text-gray-400 dark:text-gray-500 italic font-normal">Not specified</span>}</p>
        </div>
    );


    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin Dashboard</h1>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {statCards.map(card => {
                        const Icon = card.icon;
                        const count = stats[card.key as keyof ProfileStats] || 0;
                        const currentCardStatusId = getStatusId(card.key);
                        const isSelected = statusId === currentCardStatusId;

                        return (
                            <button
                                key={card.key}
                                onClick={() => currentCardStatusId && setStatusId(currentCardStatusId)}
                                className={`${card.bg} border ${isSelected ? 'ring-2 ring-indigo-500 ' + card.border : card.border} rounded-2xl p-5 text-left transition-all hover:shadow-md cursor-pointer`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg}`}>
                                        <Icon className={`w-5 h-5 ${card.color}`} />
                                    </div>
                                    {isSelected && <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full">Active</span>}
                                </div>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{count}</p>
                                <p className={`text-sm font-medium mt-1 ${card.color}`}>{card.label}</p>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Profiles Table */}
            <div className="bg-white dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-500" />
                        {statCards.find(c => getStatusId(c.key) === statusId)?.label} Profiles
                    </h2>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{profiles.length} profiles</span>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">Loading profiles...</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
                        <thead className="bg-gray-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Gotra</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Contact</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800">
                            {profiles.map(p => (
                                <>
                                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">#{p.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                    {p.photoUrl ? (
                                                        <img src={`http://localhost:8081${p.photoUrl}`} alt={p.fullName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <UserIcon className="w-4 h-4 text-indigo-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{p.fullName}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{p.gender} • {p.maritalStatus || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">{p.gotra}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">{p.contactNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => toggleProfileDetail(p.id)}
                                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors text-xs"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    {expandedProfileId === p.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const id = getStatusId('APPROVED');
                                                        if (id) updateStatus(p.id, id);
                                                    }}
                                                    className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 border border-green-200 dark:border-green-900/50 hover:bg-green-50 dark:hover:bg-green-900/20 px-2.5 py-1.5 rounded-md flex items-center gap-1 transition-colors text-xs"
                                                    title="Approve"
                                                >
                                                    <CheckCircle className="w-4 h-4" /> <span className="hidden sm:inline">Approve</span>
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        const id = getStatusId('REJECTED');
                                                        if (id) updateStatus(p.id, id);
                                                    }}
                                                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 px-2.5 py-1.5 rounded-md flex items-center gap-1 transition-colors text-xs"
                                                    title="Reject"
                                                >
                                                    <XCircle className="w-4 h-4" /> <span className="hidden sm:inline">Reject</span>
                                                </button>

                                            </div>
                                        </td>
                                    </tr>

                                    {/* Expanded Profile Detail */}
                                    {expandedProfileId === p.id && (
                                        <tr key={`detail-${p.id}`}>
                                            <td colSpan={5} className="px-6 py-6 bg-gray-50/50 dark:bg-slate-800/30">
                                                {loadingDetail ? (
                                                    <div className="text-center py-6">
                                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                                                    </div>
                                                ) : expandedProfile ? (
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-4 mb-4">
                                                            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                                                                {expandedProfile.photoUrl ? (
                                                                    <img src={`http://localhost:8081${expandedProfile.photoUrl}`} alt={expandedProfile.fullName} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <UserIcon className="w-8 h-8 text-indigo-300 dark:text-indigo-400" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{expandedProfile.fullName}</h3>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {expandedProfile.gender} • {expandedProfile.maritalStatus} • Gotra: {expandedProfile.gotra}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                            <FieldView label="Contact" value={expandedProfile.contactNumber} />
                                                            <FieldView label="Date of Birth" value={expandedProfile.dob} />
                                                            <FieldView label="Birth Time" value={expandedProfile.birthTime} />
                                                            <FieldView label="Birth Place" value={expandedProfile.birthPlace} />
                                                            <FieldView label="Height" value={expandedProfile.height} />
                                                            <FieldView label="Weight" value={expandedProfile.weight} />
                                                            <FieldView label="Complexion" value={expandedProfile.complexion} />
                                                            <FieldView label="Manglik" value={expandedProfile.isManglik} />
                                                            <FieldView label="Education" value={expandedProfile.education} />
                                                            <FieldView label="Occupation" value={expandedProfile.occupation} />
                                                            <FieldView label="Monthly Income" value={expandedProfile.monthlyIncome ? `₹${expandedProfile.monthlyIncome}` : null} />
                                                            <FieldView label="Spectacles" value={expandedProfile.wearsSpectacles ? 'Yes' : 'No'} />
                                                        </div>

                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                                                            <FieldView label="Father's Name" value={expandedProfile.fatherName} />
                                                            <FieldView label="Father's Occupation" value={expandedProfile.fatherOccupation} />
                                                            <FieldView label="Mother's Name" value={expandedProfile.motherName} />
                                                            <FieldView label="Mother's Occupation" value={expandedProfile.motherOccupation} />
                                                        </div>

                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                            <FieldView label="Bros (M/U)" value={`${expandedProfile.brothersMarried || 0} / ${expandedProfile.brothersUnmarried || 0}`} />
                                                            <FieldView label="Sis (M/U)" value={`${expandedProfile.sistersMarried || 0} / ${expandedProfile.sistersUnmarried || 0}`} />
                                                            <FieldView label="City" value={expandedProfile.familyCity} />
                                                            <FieldView label="Address" value={`${expandedProfile.familyAddress || ''}, ${expandedProfile.familyCity || ''}, ${expandedProfile.familyState || ''}`.replace(/^[,\s]+|[,\s]+$/g, '').replace(/,\s*,/g, ',')} />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-center text-gray-500 dark:text-gray-400">Failed to load profile details.</p>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                            {profiles.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Users className="w-8 h-8 text-gray-300 dark:text-gray-500" />
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 font-medium">No profiles found for this status.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
