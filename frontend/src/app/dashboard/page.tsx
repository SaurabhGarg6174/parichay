'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
    Users,
    CheckCircle,
    Clock,
    XCircle,
    FileText,
    ArrowRight,
    UserCircle,
    Heart,
    Bell
} from 'lucide-react';
import Link from 'next/link';

// Stats for Admin
interface AdminStats {
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
    ACTIVE: number;
}

// Profile for Member
interface MemberProfile {
    membershipStatus: {
        name: string;
    };
    fullName?: string;
}

export default function Dashboard() {
    const { user } = useAuth();
    const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
    const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const isAdmin = user?.roles.includes('ADMIN');

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                if (isAdmin) {
                    const res = await api.get('/admin/stats');
                    if (res.data?.success) {
                        setAdminStats(res.data.data);
                    }
                } else {
                    try {
                        const res = await api.get('/profiles/me');
                        if (res.data?.success) {
                            setMemberProfile(res.data.data);
                        }
                    } catch (e) {
                        setMemberProfile(null);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user, isAdmin]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-12 md:space-y-16">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800/60">
                <div>
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-3">Dashboard Overview</p>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                        {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
                    </h1>
                </div>
                <div className="flex flex-1 max-w-[280px] items-center gap-4 px-6 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400 flex-1 min-w-0 truncate">
                        Identity: <span className="text-slate-900 dark:text-slate-100">{user?.email.split('@')[0]}</span>
                    </span>
                </div>
            </header>

            {isAdmin ? (
                <AdminDashboardView stats={adminStats} />
            ) : (
                <MemberDashboardView profile={memberProfile} />
            )}
        </div>
    );
}

function AdminDashboardView({ stats }: { stats: AdminStats | null }) {
    const statCards = [
        { label: 'Pending Review', count: stats?.PENDING || 0, icon: Clock, color: 'text-amber-500', glow: 'shadow-amber-500/10' },
        { label: 'Approved Profiles', count: stats?.APPROVED || 0, icon: CheckCircle, color: 'text-emerald-500', glow: 'shadow-emerald-500/10' },
        { label: 'Active Members', count: stats?.ACTIVE || 0, icon: Users, color: 'text-indigo-500', glow: 'shadow-indigo-500/10' },
        { label: 'Rejected Profiles', count: stats?.REJECTED || 0, icon: XCircle, color: 'text-rose-500', glow: 'shadow-rose-500/10' },
    ];

    return (
        <div className="space-y-16 animate-in fade-in duration-1000">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <div key={i} className={`group bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-lg ${stat.glow} hover:-translate-y-2 transition-all duration-500`}>
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <div className={`p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl group-hover:rotate-12 transition-transform duration-500`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.count}</span>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest pl-4 border-l-4 border-indigo-600">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link href="/dashboard/admin/profiles?status=pending" className="group p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-800 hover:border-amber-500/30 transition-all duration-500 flex flex-col gap-6">
                            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                                <FileText className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-white mb-2">Review Pipeline</h4>
                                <p className="text-sm text-slate-400 leading-relaxed">Review and approve pending member bio-data submissions.</p>
                            </div>
                            <div className="mt-auto pt-6 flex items-center gap-2 text-amber-500 font-black text-[10px] uppercase tracking-widest">
                                Open Pipeline <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>

                        <Link href="/dashboard/admin/users" className="group p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-800 hover:border-indigo-500/30 transition-all duration-500 flex flex-col gap-6">
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-indigo-500" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-white mb-2">Manage Users</h4>
                                <p className="text-sm text-slate-400 leading-relaxed">Manage system users, permissions, and roles.</p>
                            </div>
                            <div className="mt-auto pt-6 flex items-center gap-2 text-indigo-500 font-black text-[10px] uppercase tracking-widest">
                                Open Users <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="space-y-8">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest pl-4 border-l-4 border-emerald-500">System Status</h3>
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-6 shadow-xl">
                        {[
                            { label: 'API Server', status: 'SYNCHRONIZED', color: 'text-emerald-500' },
                            { label: 'Database', status: 'ACTIVE', color: 'text-emerald-500' },
                            { label: 'File Storage', status: 'LATENCY LOW', color: 'text-indigo-400' }
                        ].map((node, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{node.label}</span>
                                <span className={`text-[10px] font-black ${node.color} uppercase tracking-widest`}>{node.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MemberDashboardView({ profile }: { profile: MemberProfile | null }) {
    const status = profile?.membershipStatus?.name || 'NOT_SUBMITTED';
    const isProfileComplete = !!profile;

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'ACTIVE': return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Authorized', icon: CheckCircle };
            case 'PENDING': return { color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Reviewing', icon: Clock };
            case 'REJECTED': return { color: 'text-rose-500', bg: 'bg-rose-500/10', label: 'Attention Required', icon: XCircle };
            default: return { color: 'text-slate-400', bg: 'bg-slate-500/10', label: 'Incomplete', icon: UserCircle };
        }
    };

    const statusInfo = getStatusInfo(status);

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="relative p-12 md:p-16 rounded-[3rem] bg-slate-900 overflow-hidden shadow-2xl">
                {/* Modern Mesh Gradient Background */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -mr-40 -mt-40 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] -ml-20 -mb-20" />

                <div className="relative z-10 grid lg:grid-cols-2 lg:items-center gap-12">
                    <div className="space-y-8">
                        <div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">Matchmaking Portal</p>
                            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none mb-6">
                                Welcome, <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-200">
                                    {profile?.fullName || 'Distinguished Member'}
                                </span>
                            </h2>
                            <p className="text-lg text-slate-300 leading-relaxed max-w-md">Your future meaningful connection begins here. Maintain your bio-data for optimal platform visibility.</p>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/dashboard/profile" className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
                                {isProfileComplete ? 'Modify Bio-Data' : 'Initialize Profile'}
                            </Link>
                            <Link href="/dashboard/matches" className="px-8 py-4 bg-slate-800 text-white border border-slate-700/50 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all hover:scale-105 active:scale-95 shadow-xl">
                                Explore Network
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/60 shadow-lg group hover:-translate-y-2 transition-all duration-500">
                        <div className="flex flex-col gap-8">
                            <div className="flex items-center gap-6">
                                <div className={`${statusInfo.bg} p-5 rounded-2xl`}>
                                    <statusInfo.icon className={`w-8 h-8 ${statusInfo.color}`} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Profile Status</p>
                                    <h3 className={`text-xl font-black uppercase tracking-tighter ${statusInfo.color}`}>{statusInfo.label}</h3>
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                {status === 'PENDING' ? 'Your profile is under review and will be verified shortly.' :
                                    status === 'ACTIVE' ? 'Your profile is verified and active.' :
                                        status === 'REJECTED' ? 'Your profile needs attention. Please update your bio-data.' :
                                            'Please create your bio-data to start the verification process.'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/60 shadow-lg group hover:-translate-y-2 transition-all duration-500">
                        <div className="flex flex-col gap-8">
                            <div className="flex items-center gap-6">
                                <div className="p-5 bg-rose-500/10 rounded-2xl">
                                    <Heart className="w-8 h-8 text-rose-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Curated List</p>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Interest Log</h3>
                                </div>
                            </div>
                            <div className="mt-4">
                                <Link href="/dashboard/matches?tab=shortlisted" className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] flex items-center group/link">
                                    View List <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover/link:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden relative">
                        <div className="flex items-center gap-3 mb-10">
                            <Bell className="w-5 h-5 text-indigo-500" />
                            <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em]">Notifications</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="relative pl-6 border-l border-indigo-500/30">
                                <p className="text-sm font-black text-slate-900 dark:text-white mb-2 leading-tight uppercase tracking-tight">Welcome to Parichay!</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">Your account has been created successfully. Welcome aboard.</p>
                                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Just Now</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


