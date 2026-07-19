'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthCard from '@/components/AuthCard';

const inputCls = 'w-full rounded-lg border border-border-strong bg-surface px-3 py-2.5 text-[13.5px] text-foreground placeholder:text-faint focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';
const labelCls = 'block text-[12.5px] font-semibold text-foreground';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', { name, email, password });
            if (data.success) {
                router.push('/login');
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard title="Create your account" subtitle="Start your journey with a trusted community.">
            {error && (
                <p className="mb-4 rounded-lg border border-danger/30 bg-danger-subtle px-3.5 py-2.5 text-[13px] text-danger">
                    {error}
                </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <label htmlFor="name" className={labelCls}>Full name</label>
                    <input
                        id="name"
                        type="text"
                        required
                        minLength={3}
                        maxLength={100}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputCls}
                        placeholder="Your full name"
                    />
                </div>
                <div className="space-y-1.5">
                    <label htmlFor="email" className={labelCls}>Email address</label>
                    <input
                        id="email"
                        type="email"
                        required
                        maxLength={255}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputCls}
                        placeholder="name@example.com"
                    />
                </div>
                <div className="space-y-1.5">
                    <label htmlFor="password" className={labelCls}>Password</label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                    <p className="text-[11.5px] text-faint">Minimum 6 characters.</p>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? 'Creating account…' : 'Create account'}
                </button>
            </form>
            <p className="mt-5 text-center text-[13px] text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
            </p>
        </AuthCard>
    );
}
