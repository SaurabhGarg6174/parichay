'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import AuthCard from '@/components/AuthCard';

const inputCls = 'w-full rounded-lg border border-border-strong bg-surface px-3 py-2.5 text-[13.5px] text-foreground placeholder:text-faint focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/forgot-password', { email });
            // Always show the same message, whether or not the email is registered.
            setSubmitted(true);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard
            title="Forgot password"
            subtitle={submitted ? undefined : "Enter your account email and we'll send you a reset link."}
        >
            {submitted ? (
                <>
                    <p className="rounded-lg border border-success/40 bg-success-subtle px-3.5 py-3 text-[13px] text-foreground">
                        If an account exists for <span className="font-semibold">{email}</span>, a password reset link has been sent to it.
                    </p>
                    <Link
                        href="/login"
                        className="mt-4 block w-full rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                    >
                        Back to sign in
                    </Link>
                </>
            ) : (
                <>
                    {error && (
                        <p className="mb-4 rounded-lg border border-danger/30 bg-danger-subtle px-3.5 py-2.5 text-[13px] text-danger">
                            {error}
                        </p>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="block text-[12.5px] font-semibold text-foreground">Email address</label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={inputCls}
                                placeholder="name@example.com"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? 'Sending…' : 'Send reset link'}
                        </button>
                    </form>
                </>
            )}

            <p className="mt-5 text-center text-[13px] text-muted-foreground">
                Remembered your password?{' '}
                <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
            </p>
        </AuthCard>
    );
}
