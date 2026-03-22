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
                        // Profile might not exist yet
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
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 md:space-y-8">

            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {isAdmin ? 'Admin Overview' : 'My Dashboard'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-lg">
                        Welcome back, <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{user?.email}</span>
                    </p>
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
        { label: 'Pending Approval', count: stats?.PENDING || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', darkBg: 'dark:bg-amber-500/10' },
        { label: 'Approved Profiles', count: stats?.APPROVED || 0, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100', darkBg: 'dark:bg-emerald-500/10' },
        { label: 'Active Members', count: stats?.ACTIVE || 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100', darkBg: 'dark:bg-indigo-500/10' },
        { label: 'Rejected Profiles', count: stats?.REJECTED || 0, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-100', darkBg: 'dark:bg-rose-500/10' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-all hover:translate-y-[-4px] hover:shadow-md">

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.label}</p>
                                <h3 className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">{stat.count}</h3>
                            </div>
                            <div className={`${stat.bg} ${stat.darkBg} p-4 rounded-2xl`}>
                                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 md:p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Admin Quick Actions</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Link href="/dashboard/admin/profiles?status=pending" className="flex items-center p-5 rounded-2xl border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all group border-l-4 border-l-amber-500">
                            <div className="bg-amber-100 dark:bg-amber-500/10 p-3 rounded-xl mr-5">
                                <FileText className="w-6 h-6 text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-gray-900 dark:text-white text-lg">Review Pending</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Review new member bio-data</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-amber-500 transition-colors" />
                        </Link>
                        
                        <Link href="/dashboard/admin/users" className="flex items-center p-5 rounded-2xl border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all group border-l-4 border-l-indigo-500">
                            <div className="bg-indigo-100 dark:bg-indigo-500/10 p-3 rounded-xl mr-5">
                                <Users className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-gray-900 dark:text-white text-lg">User Management</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Manage registrations & roles</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                        </Link>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8">System Health</h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500 dark:text-gray-400">API Status</span>
                            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold">OPERATIONAL</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Database</span>
                            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold">CONNECTED</span>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-100 dark:border-slate-800">
                        <p className="text-sm text-gray-400 italic">No alerts at this time.</p>
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
            case 'ACTIVE': return { color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Active Profile', icon: CheckCircle };
            case 'PENDING': return { color: 'text-amber-600', bg: 'bg-amber-100', label: 'In Review', icon: Clock };
            case 'REJECTED': return { color: 'text-rose-600', bg: 'bg-rose-100', label: 'Rejected', icon: XCircle };
            default: return { color: 'text-gray-400', bg: 'bg-gray-100', label: 'Not Found', icon: UserCircle };
        }
    };

    const statusInfo = getStatusInfo(status);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 rounded-2xl md:rounded-[2rem] shadow-xl p-6 md:p-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <h2 className="text-2xl md:text-3xl font-extrabold mb-3 line-clamp-2 md:line-clamp-none">Hello, {profile?.fullName || 'Member'}!</h2>
                        <p className="text-indigo-100 text-base md:text-lg mb-8 max-w-md">Find your meaningful connection today. Make sure your bio-data is up to date for better visibility.</p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/dashboard/profile" className="bg-white text-indigo-700 px-6 md:px-8 py-3.5 rounded-2xl font-bold shadow-soft hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95 text-center">
                                {isProfileComplete ? 'Manage My Profile' : 'Create My Bio-data'}
                            </Link>
                            <Link href="/dashboard/matches" className="bg-indigo-500/30 backdrop-blur-md border border-indigo-200/20 text-white px-6 md:px-8 py-3.5 rounded-2xl font-bold hover:bg-indigo-500/40 transition-all hover:scale-105 active:scale-95 text-center">
                                Browse Matches
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-800 group hover:shadow-md transition-all">
                        <div className="flex items-center space-x-4 md:space-x-5 mb-6">
                            <div className={`${statusInfo.bg} dark:bg-slate-800 p-3 md:p-4 rounded-xl md:rounded-2xl transition-transform group-hover:scale-110 shrink-0`}>
                                <statusInfo.icon className={`w-6 h-6 md:w-8 md:h-8 ${statusInfo.color}`} />
                            </div>
                            <div>
                                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Profile Status</h3>
                                <p className={`text-xs md:text-sm font-bold uppercase tracking-widest mt-0.5 ${statusInfo.color}`}>{statusInfo.label}</p>
                            </div>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm md:text-base">
                            {status === 'PENDING' ? 'Our administrators are currently reviewing your profile for quality verification. This usually takes 24-48 hours.' : 
                             status === 'ACTIVE' ? 'Congratulatons! Your profile is now active and visible to eligible matches within the platform.' : 
                             status === 'REJECTED' ? 'Your profile was not approved. Please check your email for details or update your bio-data to resubmit.' :
                             'Start your journey by creating a comprehensive bio-data. This helps us find the best matches for you.'}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-800 group hover:shadow-md transition-all">
                        <div className="flex items-center space-x-4 md:space-x-5 mb-6">
                            <div className="bg-rose-100 dark:bg-rose-500/10 p-3 md:p-4 rounded-xl md:rounded-2xl transition-transform group-hover:scale-110 shrink-0">
                                <Heart className="w-6 h-6 md:w-8 md:h-8 text-rose-600" />
                            </div>
                            <div>
                                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Shortlisted</h3>
                                <p className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-widest mt-0.5">0 Profiles</p>
                            </div>
                        </div>
                        <Link href="/dashboard/matches?tab=shortlisted" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center group text-sm md:text-base">
                            Manage selection <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

            </div>

            <div className="space-y-6 md:space-y-8">
                <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-800 p-6 md:p-8">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-6 md:mb-8 flex items-center">
                        <Bell className="w-5 h-5 md:w-6 md:h-6 mr-3 text-indigo-500" />
                        Updates
                    </h3>
                    <div className="space-y-4 md:space-y-6">
                        <div className="p-4 md:p-5 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-[1.2rem] md:rounded-[1.5rem] border border-indigo-100/50 dark:border-indigo-500/10">
                            <p className="font-bold text-gray-900 dark:text-white mb-1 text-xs md:text-sm">Welcome to Parichay!</p>
                            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Your account has been successfully created. Complete your bio-data to proceed.</p>
                            <p className="text-[10px] text-indigo-400 font-bold mt-3 uppercase tracking-widest">Just now</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-indigo-900 rounded-2xl md:rounded-[2rem] p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <h4 className="font-bold mb-3 md:mb-4">Need Assistance?</h4>
                        <p className="text-xs md:text-sm text-indigo-200 mb-6">Our support team is available to help you with profile verification or match assistance.</p>
                        <button className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 rounded-xl md:rounded-2xl transition-all">
                            Help Center
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}

