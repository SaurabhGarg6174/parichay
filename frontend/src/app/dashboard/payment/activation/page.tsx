'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { CheckCircle, Clock, XCircle, CreditCard, AlertCircle } from 'lucide-react';
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
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    const statusName = profile?.membershipStatus?.name || 'NOT_SUBMITTED';

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Activation Status</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Track the activation journey of your profile</p>
            </header>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                    
                    {/* Status Icon Indicator */}
                    <div className="shrink-0 flex items-center justify-center w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 shadow-lg bg-gray-50 dark:bg-slate-800/50">
                        {statusName === 'ACTIVE' && <CheckCircle className="w-12 h-12 text-emerald-500" />}
                        {statusName === 'APPROVED' && <CreditCard className="w-12 h-12 text-indigo-500" />}
                        {statusName === 'PENDING' && <Clock className="w-12 h-12 text-amber-500" />}
                        {statusName === 'REJECTED' && <XCircle className="w-12 h-12 text-rose-500" />}
                        {statusName === 'NOT_SUBMITTED' && <AlertCircle className="w-12 h-12 text-gray-400" />}
                    </div>

                    <div className="flex-1 space-y-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {statusName === 'ACTIVE' ? 'Profile is Fully Active' :
                                 statusName === 'APPROVED' ? 'Profile Approved - Payment Pending' :
                                 statusName === 'PENDING' ? 'Profile Under Review' :
                                 statusName === 'REJECTED' ? 'Profile Needs Revision' :
                                 'Bio-Data Not Submitted'}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                {statusName === 'ACTIVE' ? 'Congratulations! You can fully interact with matches and messages.' :
                                 statusName === 'APPROVED' ? 'Your bio-data looks great. Just complete your membership fee to turn your profile active.' :
                                 statusName === 'PENDING' ? 'Our administrative team is actively reviewing your bio-data to maintain community safety. This can take 24-48 hours.' :
                                 statusName === 'REJECTED' ? 'Unfortunately your profile submission was rejected. Review our guidelines and try submitting again.' :
                                 'To start finding your matches, you must accurately submit your complete bio-data first.'}
                            </p>
                        </div>
                        
                        <div className="pt-2 flex flex-col sm:flex-row gap-3">
                            {statusName === 'NOT_SUBMITTED' && (
                                <Link href="/dashboard/profile" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-soft transition-colors text-center">
                                    Create Bio-Data
                                </Link>
                            )}
                            
                            {(statusName === 'PENDING' || statusName === 'REJECTED' || statusName === 'ACTIVE' || statusName === 'APPROVED') && (
                                <Link href="/dashboard/profile" className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-900 dark:text-white rounded-xl text-sm font-bold shadow-soft transition-colors text-center inline-flex items-center justify-center">
                                    View Full Profile
                                </Link>
                            )}
                            
                            {(statusName === 'APPROVED' || statusName === 'PENDING') && (
                                <Link href="/dashboard/payment/memberships" className="px-6 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-200 dark:shadow-none text-center inline-flex items-center justify-center gap-2">
                                    <CreditCard className="w-4 h-4" /> View Plans & Pay
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Activation Checklist</h3>
                
                <div className="space-y-6">
                    <div className="flex gap-4 items-start">
                        <div className={`mt-0.5 shrink-0 ${statusName !== 'NOT_SUBMITTED' ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'}`}>
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className={`font-semibold ${statusName !== 'NOT_SUBMITTED' ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>Complete Bio-Data</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Fill out your personal, professional, and family details comprehensively.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start relative">
                        {/* Connecting Line */}
                        <div className={`absolute top-0 bottom-full -mt-4 left-3 w-px -ml-px ${['APPROVED', 'ACTIVE'].includes(statusName) ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-slate-700'}`}></div>
                        
                        <div className={`mt-0.5 shrink-0 relative z-10 bg-white dark:bg-slate-900 ${['APPROVED', 'ACTIVE'].includes(statusName) ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'}`}>
                            {statusName === 'REJECTED' ? <XCircle className="w-6 h-6 text-rose-500" /> : <CheckCircle className="w-6 h-6" />}
                        </div>
                        <div>
                            <p className={`font-semibold ${['APPROVED', 'ACTIVE'].includes(statusName) ? 'text-gray-900 dark:text-white' : statusName === 'REJECTED' ? 'text-rose-600' : 'text-gray-400 dark:text-gray-500'}`}>Admin Approval</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Our administrators will review your profile for safety and genuineness.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start relative">
                         {/* Connecting Line */}
                         <div className={`absolute top-0 bottom-full -mt-4 left-3 w-px -ml-px ${statusName === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-slate-700'}`}></div>

                        <div className={`mt-0.5 shrink-0 relative z-10 bg-white dark:bg-slate-900 ${statusName === 'ACTIVE' ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'}`}>
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className={`font-semibold ${statusName === 'ACTIVE' ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>Platform Membership</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Secure your account by activating a standard platform membership.</p>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}
