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
    Bell,
    CreditCard,
    Search,
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
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
            </div>
        );
    }

    const greeting = (() => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    })();

    const firstName = memberProfile?.fullName?.split(' ')[0] || user?.email.split('@')[0];

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-[21px] font-semibold tracking-tight text-foreground">
                        {isAdmin ? 'Admin dashboard' : `${greeting}, ${firstName}`}
                    </h1>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">
                        {isAdmin ? 'Platform overview and moderation queue.' : "Here's where your profile stands today."}
                    </p>
                </div>
                {!isAdmin && (
                    <div className="flex shrink-0 gap-2">
                        <Link
                            href="/dashboard/profile"
                            className="rounded-lg border border-border-strong bg-surface px-3.5 py-2 text-[13px] font-semibold text-foreground transition-colors hover:bg-surface-hover"
                        >
                            {memberProfile ? 'Edit bio-data' : 'Create bio-data'}
                        </Link>
                        <Link
                            href="/dashboard/matches"
                            className="rounded-lg bg-primary px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover"
                        >
                            Browse matches
                        </Link>
                    </div>
                )}
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
        { label: 'Pending review', count: stats?.PENDING || 0, icon: Clock, color: 'text-warning' },
        { label: 'Approved profiles', count: stats?.APPROVED || 0, icon: CheckCircle, color: 'text-success' },
        { label: 'Active members', count: stats?.ACTIVE || 0, icon: Users, color: 'text-info' },
        { label: 'Rejected profiles', count: stats?.REJECTED || 0, icon: XCircle, color: 'text-danger' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-border bg-surface p-4 shadow-card">
                        <div className="flex items-center justify-between">
                            <p className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-faint">{stat.label}</p>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} aria-hidden />
                        </div>
                        <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground tabular-nums">{stat.count}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
                    <Link
                        href="/dashboard/admin/profiles?status=pending"
                        className="group rounded-xl border border-border bg-surface p-5 shadow-card transition-shadow hover:border-border-strong hover:shadow-lifted"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning-subtle">
                            <FileText className="h-4.5 w-4.5 text-warning" aria-hidden />
                        </span>
                        <h3 className="mt-4 text-[15px] font-semibold text-foreground">Review pipeline</h3>
                        <p className="mt-1 text-[13px] text-muted-foreground">Review and approve pending member bio-data submissions.</p>
                        <span className="mt-4 flex items-center gap-1.5 text-[12.5px] font-semibold text-primary">
                            Open pipeline <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                        </span>
                    </Link>

                    <Link
                        href="/dashboard/admin/users"
                        className="group rounded-xl border border-border bg-surface p-5 shadow-card transition-shadow hover:border-border-strong hover:shadow-lifted"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-info-subtle">
                            <Users className="h-4.5 w-4.5 text-info" aria-hidden />
                        </span>
                        <h3 className="mt-4 text-[15px] font-semibold text-foreground">Manage users</h3>
                        <p className="mt-1 text-[13px] text-muted-foreground">Manage system users, permissions, and roles.</p>
                        <span className="mt-4 flex items-center gap-1.5 text-[12.5px] font-semibold text-primary">
                            Open users <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                        </span>
                    </Link>
                </div>

                <div className="rounded-xl border border-border bg-surface shadow-card">
                    <div className="border-b border-border px-5 py-3.5">
                        <h3 className="text-sm font-semibold text-foreground">System status</h3>
                    </div>
                    <div className="px-5 py-2">
                        {[
                            { label: 'API server', status: 'Operational' },
                            { label: 'Database', status: 'Operational' },
                            { label: 'File storage', status: 'Operational' },
                        ].map((node) => (
                            <div key={node.label} className="flex items-center justify-between border-b border-border py-2.5 text-[13px] last:border-b-0">
                                <span className="text-muted-foreground">{node.label}</span>
                                <span className="flex items-center gap-1.5 font-medium text-success">
                                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                                    {node.status}
                                </span>
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

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'ACTIVE': return {
                badge: 'bg-success-subtle text-success', label: 'Verified & active', icon: CheckCircle, iconColor: 'text-success',
                message: 'Your profile is verified and visible to matches.',
            };
            case 'PENDING': return {
                badge: 'bg-warning-subtle text-warning', label: 'Pending activation', icon: Clock, iconColor: 'text-warning',
                message: 'Activate your membership to unlock matches and search features.',
            };
            case 'INACTIVE': return {
                badge: 'bg-danger-subtle text-danger', label: 'Inactive', icon: XCircle, iconColor: 'text-danger',
                message: 'Your profile has been deactivated by the administrator.',
            };
            default: return {
                badge: 'bg-surface-muted text-muted-foreground', label: 'Not submitted', icon: UserCircle, iconColor: 'text-faint',
                message: 'Create your bio-data to start the membership process.',
            };
        }
    };

    const statusInfo = getStatusInfo(status);

    const quickActions = [
        { href: '/dashboard/profile', icon: FileText, label: profile ? 'Update bio-data' : 'Create bio-data' },
        { href: '/dashboard/matches', icon: Search, label: 'Search matches' },
        { href: '/dashboard/matches?tab=shortlisted', icon: Heart, label: 'View shortlist' },
        { href: '/dashboard/payment/memberships', icon: CreditCard, label: 'Manage membership' },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
                {/* Profile status */}
                <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
                    <div className="flex items-start gap-4">
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${statusInfo.badge.split(' ')[0]}`}>
                            <statusInfo.icon className={`h-5 w-5 ${statusInfo.iconColor}`} aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-[15px] font-semibold text-foreground">Profile status</h3>
                                <span className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${statusInfo.badge}`}>
                                    {statusInfo.label}
                                </span>
                            </div>
                            <p className="mt-1 text-[13px] text-muted-foreground">{statusInfo.message}</p>
                        </div>
                        {status === 'NOT_SUBMITTED' && (
                            <Link
                                href="/dashboard/profile"
                                className="shrink-0 rounded-lg bg-primary px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover"
                            >
                                Get started
                            </Link>
                        )}
                        {status === 'PENDING' && (
                            <Link
                                href="/dashboard/payment/memberships"
                                className="shrink-0 rounded-lg bg-primary px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover"
                            >
                                Activate membership
                            </Link>
                        )}
                    </div>
                </div>

                {/* Shortlist */}
                <div className="rounded-xl border border-border bg-surface shadow-card">
                    <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                        <h3 className="text-sm font-semibold text-foreground">Your shortlist</h3>
                        <Link href="/dashboard/matches?tab=shortlisted" className="text-[12.5px] font-semibold text-primary hover:underline">
                            View all
                        </Link>
                    </div>
                    <div className="flex items-center gap-3 px-5 py-4">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-subtle">
                            <Heart className="h-4.5 w-4.5 text-primary" aria-hidden />
                        </span>
                        <p className="text-[13px] text-muted-foreground">
                            Profiles you shortlist while browsing matches appear here for quick comparison.
                        </p>
                    </div>
                </div>

                {/* Quick actions */}
                <div className="rounded-xl border border-border bg-surface shadow-card">
                    <div className="border-b border-border px-5 py-3.5">
                        <h3 className="text-sm font-semibold text-foreground">Quick actions</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2">
                        {quickActions.map((action) => (
                            <Link
                                key={action.label}
                                href={action.href}
                                className="flex items-center gap-2.5 rounded-lg border border-border px-3.5 py-2.5 text-[13px] font-semibold text-foreground transition-colors hover:border-border-strong hover:bg-surface-hover"
                            >
                                <action.icon className="h-4 w-4 text-muted-foreground" aria-hidden />
                                {action.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right rail */}
            <div className="space-y-4">
                <div className="rounded-xl border border-border bg-surface shadow-card">
                    <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
                        <Bell className="h-4 w-4 text-muted-foreground" aria-hidden />
                        <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                    </div>
                    <div className="px-5 py-4">
                        <p className="text-[13px] font-semibold text-foreground">Welcome to Parichay</p>
                        <p className="mt-1 text-[12.5px] text-muted-foreground">Your account has been created successfully. Complete your bio-data to get discovered.</p>
                        <p className="mt-2 text-[11.5px] text-faint">Just now</p>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
                    <h3 className="text-sm font-semibold text-foreground">Need help?</h3>
                    <p className="mt-1 text-[13px] text-muted-foreground">
                        Our team helps with profile setup, photo requests and membership questions.
                    </p>
                    <button className="mt-3 rounded-lg border border-border-strong bg-surface px-3.5 py-2 text-[13px] font-semibold text-foreground transition-colors hover:bg-surface-hover">
                        Contact support
                    </button>
                </div>
            </div>
        </div>
    );
}
