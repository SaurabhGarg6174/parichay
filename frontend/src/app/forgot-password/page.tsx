'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

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
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 md:p-8 bg-gray-50/50 dark:bg-transparent">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl shadow-xl p-6 md:p-10 border border-gray-100 dark:border-slate-800">
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent text-center mb-3">
                    Forgot Password
                </h2>

                {submitted ? (
                    <>
                        <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6">
                            If an account exists for <span className="font-medium text-gray-900 dark:text-gray-200">{email}</span>, a password reset link has been sent to it.
                        </p>
                        <Link
                            href="/login"
                            className="block w-full text-center bg-indigo-600 dark:bg-indigo-500 text-white font-medium py-3 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                        >
                            Back to Login
                        </Link>
                    </>
                ) : (
                    <>
                        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-8">
                            Enter the email linked to your account and we&apos;ll send you a link to reset your password.
                        </p>
                        {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30 mb-4">{error}</p>}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
                                    placeholder="hello@example.com"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 dark:bg-indigo-500 text-white font-medium py-3 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    </>
                )}

                <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    Remembered your password?{' '}
                    <Link href="/login" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
}
