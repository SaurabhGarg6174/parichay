'use client';

import { useState } from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const TRUST_POINTS = [
    'Every profile manually verified by our team',
    'Photos shared only with your consent',
    'Backed by a 50-year-old community publication',
];

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            if (data.success && data.data?.token) {
                localStorage.setItem('token', data.data.token);
                const meRes = await api.get('/auth/me', { headers: { Authorization: `Bearer ${data.data.token}` } });
                login(data.data.token, meRes.data.data, data.data.refreshToken);

                if (meRes.data.data.roles?.some((r: any) => r.name === 'ADMIN')) {
                    router.push('/admin');
                } else {
                    router.push('/dashboard');
                }
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Brand panel */}
            <aside className="relative hidden w-[44%] shrink-0 flex-col overflow-hidden border-r border-border bg-surface-muted p-10 lg:flex xl:p-14">
                <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-base font-semibold text-white">प</span>
                    <span className="leading-tight">
                        <span className="block text-base font-semibold tracking-tight text-foreground">Parichay</span>
                        <span className="block text-[10.5px] font-medium uppercase tracking-[0.06em] text-faint">by Aggarjan Patrika</span>
                    </span>
                </div>

                <div className="mt-auto">
                    <p className="max-w-[22ch] font-serif text-2xl leading-snug tracking-tight text-foreground xl:text-[26px]">
                        Where families meet with <span className="text-primary">trust</span>, and introductions become relationships.
                    </p>
                    <p className="mt-4 text-xs text-faint">Serving the Aggarwal community since 1975</p>
                    <ul className="mt-8 space-y-2.5">
                        {TRUST_POINTS.map((point) => (
                            <li key={point} className="flex items-start gap-2.5 text-[13px] text-muted-foreground">
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Concentric-circle motif */}
                <div aria-hidden className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full border border-border-strong opacity-70" />
                <div aria-hidden className="pointer-events-none absolute -bottom-8 -right-8 h-64 w-64 rounded-full border border-border opacity-80" />
            </aside>

            {/* Form panel */}
            <div className="flex flex-1 items-center justify-center bg-surface px-4 py-10 sm:px-10">
                <div className="w-full max-w-[360px]">
                    <div className="mb-8 flex items-center gap-2.5 lg:hidden">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-[15px] font-semibold text-white">प</span>
                        <span className="leading-tight">
                            <span className="block text-[15px] font-semibold tracking-tight text-foreground">Parichay</span>
                            <span className="block text-[10px] font-medium uppercase tracking-[0.06em] text-faint">by Aggarjan Patrika</span>
                        </span>
                    </div>
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">Sign in</h1>
                    <p className="mt-1 text-[13.5px] text-muted-foreground">Welcome back. Enter your details to continue.</p>

                    {error && (
                        <p className="mt-5 rounded-lg border border-danger/30 bg-danger-subtle px-3.5 py-2.5 text-[13px] text-danger">
                            {error}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="block text-[12.5px] font-semibold text-foreground">Email address</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-lg border border-border-strong bg-surface px-3 py-2.5 text-[13.5px] text-foreground placeholder:text-faint focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="name@example.com"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex items-baseline justify-between">
                                <label htmlFor="password" className="block text-[12.5px] font-semibold text-foreground">Password</label>
                                <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-lg border border-border-strong bg-surface px-3 py-2.5 pr-11 text-[13.5px] text-foreground placeholder:text-faint focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    placeholder="Your password"
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
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? 'Signing in…' : 'Sign in'}
                        </button>
                    </form>

                    <p className="mt-5 text-center text-[13px] text-muted-foreground">
                        New to Parichay?{' '}
                        <Link href="/register" className="font-semibold text-primary hover:underline">Create a profile</Link>
                    </p>

                    <p className="mt-6 border-t border-border pt-4 text-center text-[11.5px] text-faint">
                        Protected by encryption · Your details stay private
                    </p>
                </div>
            </div>
        </div>
    );
}
