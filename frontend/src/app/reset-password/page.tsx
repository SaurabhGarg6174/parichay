'use client';

import { Suspense, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

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
                <p className="text-sm text-center text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30 mb-6">
                    This reset link is missing its token. Please request a new one.
                </p>
                <Link
                    href="/forgot-password"
                    className="block w-full text-center bg-indigo-600 dark:bg-indigo-500 text-white font-medium py-3 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                    Request a new link
                </Link>
            </>
        );
    }

    if (success) {
        return (
            <p className="text-sm text-center text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                Password reset successfully. Redirecting you to login&hellip;
            </p>
        );
    }

    return (
        <>
            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-8">
                Choose a new password for your account.
            </p>
            {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={6}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(prev => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors"
                            tabIndex={-1}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={confirmationPassword}
                        onChange={(e) => setConfirmationPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
                        placeholder="••••••••"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 dark:bg-indigo-500 text-white font-medium py-3 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                    {loading ? 'Resetting...' : 'Reset Password'}
                </button>
            </form>
        </>
    );
}

export default function ResetPassword() {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 md:p-8 bg-gray-50/50 dark:bg-transparent">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl shadow-xl p-6 md:p-10 border border-gray-100 dark:border-slate-800">
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent text-center mb-3">
                    Reset Password
                </h2>
                <Suspense fallback={<p className="text-sm text-center text-gray-500 dark:text-gray-400">Loading&hellip;</p>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
