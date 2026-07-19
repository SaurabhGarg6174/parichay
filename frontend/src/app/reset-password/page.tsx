'use client';

import { Suspense, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import AuthCard from '@/components/AuthCard';

const inputCls = 'w-full rounded-lg border border-border-strong bg-surface px-3 py-2.5 text-[13.5px] text-foreground placeholder:text-faint focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';
const labelCls = 'block text-[12.5px] font-semibold text-foreground';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token') || '';

    const [newPassword, setNewPassword] = useState('');
    const [confirmationPassword, setConfirmationPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmationPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { token, newPassword, confirmationPassword });
            setSuccess(true);
            setTimeout(() => router.push('/login'), 2000);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to reset password. The link may have expired.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <>
                <p className="rounded-lg border border-danger/30 bg-danger-subtle px-3.5 py-3 text-[13px] text-danger">
                    This reset link is missing its token. Please request a new one.
                </p>
                <Link
                    href="/forgot-password"
                    className="mt-4 block w-full rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                >
                    Request a new link
                </Link>
            </>
        );
    }

    if (success) {
        return (
            <p className="rounded-lg border border-success/40 bg-success-subtle px-3.5 py-3 text-[13px] text-foreground">
                Password reset successfully. Redirecting you to sign in&hellip;
            </p>
        );
    }

    return (
        <>
            {error && (
                <p className="mb-4 rounded-lg border border-danger/30 bg-danger-subtle px-3.5 py-2.5 text-[13px] text-danger">
                    {error}
                </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <label htmlFor="new-password" className={labelCls}>New password</label>
                    <div className="relative">
                        <input
                            id="new-password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={6}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={`${inputCls} pr-11`}
                            placeholder="At least 6 characters"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(prev => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-faint transition-colors hover:text-foreground"
                            tabIndex={-1}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                        </button>
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label htmlFor="confirm-password" className={labelCls}>Confirm new password</label>
                    <input
                        id="confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={confirmationPassword}
                        onChange={(e) => setConfirmationPassword(e.target.value)}
                        className={inputCls}
                        placeholder="Repeat the new password"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? 'Resetting…' : 'Reset password'}
                </button>
            </form>
        </>
    );
}

export default function ResetPassword() {
    return (
        <AuthCard title="Reset password" subtitle="Choose a new password for your account.">
            <Suspense fallback={<p className="text-center text-[13px] text-muted-foreground">Loading&hellip;</p>}>
                <ResetPasswordForm />
            </Suspense>
        </AuthCard>
    );
}
