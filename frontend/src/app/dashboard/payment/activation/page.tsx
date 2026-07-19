'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { CheckCircle, Clock, XCircle, CreditCard, AlertCircle, Circle } from 'lucide-react';
import Link from 'next/link';

export default function ActivationStatusPage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/profiles/me');
                if (res.data?.success) {
                    setProfile(res.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch profile', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProfile();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
            </div>
        );
    }

    const statusName = profile?.membershipStatus?.name || 'NOT_SUBMITTED';

    const statusView = {
        ACTIVE: {
            icon: <CheckCircle className="h-6 w-6 text-success" aria-hidden />, iconBg: 'bg-success-subtle',
            badge: 'bg-success-subtle text-success', badgeLabel: 'Active',
            title: 'Profile is fully active',
            message: 'You can fully interact with matches and view contact details.',
        },
        PENDING: {
            icon: <CreditCard className="h-6 w-6 text-info" aria-hidden />, iconBg: 'bg-info-subtle',
            badge: 'bg-info-subtle text-info', badgeLabel: 'Payment pending',
            title: 'Bio-data submitted — payment pending',
            message: 'Complete your membership subscription to activate your profile and unlock matchmaking.',
        },
        INACTIVE: {
            icon: <XCircle className="h-6 w-6 text-danger" aria-hidden />, iconBg: 'bg-danger-subtle',
            badge: 'bg-danger-subtle text-danger', badgeLabel: 'Inactive',
            title: 'Profile is inactive',
            message: 'Your profile has been deactivated by the administrator. Contact support for help.',
        },
        NOT_SUBMITTED: {
            icon: <AlertCircle className="h-6 w-6 text-faint" aria-hidden />, iconBg: 'bg-surface-muted',
            badge: 'bg-surface-muted text-muted-foreground', badgeLabel: 'Not submitted',
            title: 'Bio-data not submitted',
            message: 'Submit your complete bio-data to start the activation process.',
        },
    }[statusName as string] ?? {
        icon: <AlertCircle className="h-6 w-6 text-faint" aria-hidden />, iconBg: 'bg-surface-muted',
        badge: 'bg-surface-muted text-muted-foreground', badgeLabel: statusName,
        title: 'Profile status', message: '',
    };

    const steps = [
        {
            title: 'Complete bio-data',
            description: 'Fill out your personal, professional and family details.',
            done: statusName !== 'NOT_SUBMITTED',
            failed: false,
        },
        {
            title: 'Platform membership',
            description: 'Activate a membership to unlock contact details and search matches.',
            done: statusName === 'ACTIVE',
            failed: statusName === 'INACTIVE',
        },
    ];

    return (
        <div className="mx-auto max-w-3xl space-y-4">
            <header className="mb-6">
                <p className="text-xs text-faint">Payments / <span className="font-medium text-muted-foreground">Activation Status</span></p>
                <h1 className="mt-1 text-[21px] font-semibold tracking-tight text-foreground">Activation status</h1>
                <p className="mt-0.5 text-[13px] text-muted-foreground">Track how close your profile is to going live.</p>
            </header>

            {/* Status card */}
            <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
                <div className="flex items-start gap-4">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${statusView.iconBg}`}>
                        {statusView.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-[15px] font-semibold text-foreground">{statusView.title}</h2>
                            <span className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${statusView.badge}`}>
                                {statusView.badgeLabel}
                            </span>
                        </div>
                        <p className="mt-1 text-[13px] text-muted-foreground">{statusView.message}</p>

                        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                            {statusName === 'NOT_SUBMITTED' ? (
                                <Link href="/dashboard/profile" className="rounded-lg bg-primary px-3.5 py-2 text-center text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover">
                                    Create bio-data
                                </Link>
                            ) : (
                                <Link href="/dashboard/profile" className="rounded-lg border border-border-strong bg-surface px-3.5 py-2 text-center text-[13px] font-semibold text-foreground transition-colors hover:bg-surface-hover">
                                    View full profile
                                </Link>
                            )}
                             {statusName === 'PENDING' && (
                                <Link href="/dashboard/payment/memberships" className="flex items-center justify-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover">
                                    <CreditCard className="h-4 w-4" aria-hidden /> View plans &amp; pay
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Checklist */}
            <div className="rounded-xl border border-border bg-surface shadow-card">
                <div className="border-b border-border px-5 py-3.5">
                    <h3 className="text-sm font-semibold text-foreground">Activation checklist</h3>
                </div>
                <div className="px-5 py-4">
                    {steps.map((step, i) => (
                        <div key={step.title} className="relative flex gap-3.5 pb-5 last:pb-0">
                            {i < steps.length - 1 && (
                                <span className={`absolute left-[9px] top-6 bottom-0 w-px ${step.done ? 'bg-success' : 'bg-border'}`} aria-hidden />
                            )}
                            <span className="relative z-10 mt-0.5 shrink-0 bg-surface">
                                {step.failed ? (
                                    <XCircle className="h-[18px] w-[18px] text-danger" aria-hidden />
                                ) : step.done ? (
                                    <CheckCircle className="h-[18px] w-[18px] text-success" aria-hidden />
                                ) : (
                                    <Circle className="h-[18px] w-[18px] text-border-strong" aria-hidden />
                                )}
                            </span>
                            <div>
                                <p className={`text-[13.5px] font-semibold ${step.failed ? 'text-danger' : step.done ? 'text-foreground' : 'text-faint'}`}>
                                    {step.title}
                                </p>
                                <p className="mt-0.5 text-[12.5px] text-muted-foreground">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
