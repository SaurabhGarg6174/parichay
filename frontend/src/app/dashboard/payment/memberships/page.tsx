'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Check, Star, Shield, Gem } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function MembershipsPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

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

        if (user) fetchProfile();
    }, [user]);

    const handleMakePayment = async (amountInINR: number, planName: string) => {
        if (!profile) {
             showToast("Please submit your bio-data first.", "error");
             return;
        }
        
        try {
            setProcessing(true);
            showToast('Initiating secure payment...', 'success');
            const { data } = await api.post('/payments/initiate', { amount: amountInINR, currency: 'INR' });
            const orderId = data.data.orderId;

            const options = {
                key: 'rzp_test_SVATz6ya6yetjJ',
                amount: amountInINR * 100,
                currency: "INR",
                name: "Parichay",
                description: `${planName} Membership`,
                order_id: orderId,
                handler: async function (response: any) {
                    try {
                        showToast('Verifying payment with bank...', 'success');
                        await api.post('/payments/verify', { 
                            orderId: response.razorpay_order_id, 
                            paymentId: response.razorpay_payment_id, 
                            razorpaySignature: response.razorpay_signature 
                        });
                        showToast('Payment Successful! Welcome aboard!', 'success');
                        window.location.href = "/dashboard/payment/activation";
                    } catch (err: any) {
                        showToast(err.response?.data?.message || 'Payment verification failed', 'error');
                        setProcessing(false);
                    }
                },
                prefill: {
                    name: profile?.fullName || "",
                    email: user?.email || "",
                    contact: profile?.contactNumber || ""
                },
                theme: {
                    color: "#4f46e5"
                }
            };
            
            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                showToast(response.error.description || 'Payment Failed', 'error');
                setProcessing(false);
            });
            rzp.open();

        } catch (err: any) {
            showToast(err.response?.data?.message || 'Failed to initialize payment gateway', 'error');
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    const isActive = profile?.membershipStatus?.name === 'ACTIVE';

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Simple, Transparent Pricing</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400">Unlock your journey to finding the perfect match with our flexible monthly or yearly membership.</p>
            </div>

            {isActive && (
                <div className="max-w-5xl mx-auto px-4">
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-5 flex items-center gap-4">
                        <div className="shrink-0 w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center">
                            <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="font-bold text-emerald-800 dark:text-emerald-300">You have an active membership</p>
                            <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-0.5">Your profile is currently active. You can renew or upgrade your plan at any time.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
                
                {/* Basic Plan */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col justify-between opacity-75 grayscale-[50%] transition-all hover:grayscale-0 hover:opacity-100 hover:-translate-y-1 hover:shadow-lg">
                    <div>
                        <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
                            <Shield className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Basic Access</h3>
                        <div className="mt-4 flex items-baseline text-gray-900 dark:text-white">
                            <span className="text-4xl font-black tracking-tight">Free</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">For browsing and setting up your bio-data footprint.</p>
                        <ul className="mt-8 space-y-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                            {['Create Bio-Data Profile', 'View Match Outlines', 'Community Access'].map((feature, i) => (
                                <li key={i} className="flex gap-3 items-center">
                                    <Check className="w-5 h-5 text-gray-400 shrink-0" /> {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Monthly Plan */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-lg">
                    <div>
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mb-6">
                            <Star className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Monthly Flex</h3>
                        <div className="mt-4 flex items-baseline text-gray-900 dark:text-white">
                            <span className="text-4xl font-black tracking-tight">₹300</span>
                            <span className="ml-2 text-gray-500 font-medium">/ month</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Flexibility to find your matches month-by-month.</p>
                        <ul className="mt-8 space-y-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                            {['Full Bio-Data Access', 'Direct messaging to Matches', 'Priority Admin Approvals', 'Verification Badge'].map((feature, i) => (
                                <li key={i} className="flex gap-3 items-center">
                                    <Check className="w-5 h-5 text-indigo-500 shrink-0" /> {feature}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-10">
                        <button 
                            onClick={() => handleMakePayment(300, 'Monthly Flex')}
                            disabled={processing || !profile || isActive}
                            className="w-full bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 active:scale-95 hover:bg-indigo-100 dark:hover:bg-slate-700 font-bold py-4 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {processing ? (
                                <div className="w-5 h-5 border-2 border-indigo-700 dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : isActive ? 'Renew Monthly' : 'Start Monthly'}
                        </button>
                        {!profile && <p className="text-center text-xs mt-3 text-gray-400">Please submit bio-data first.</p>}
                    </div>
                </div>

                {/* Yearly Plan (The active one) */}
                <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-500/20 text-white flex flex-col justify-between transform md:-translate-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="absolute top-6 right-6 px-4 py-1.5 bg-amber-500/30 backdrop-blur-md rounded-full text-[10px] font-black text-amber-300 tracking-widest uppercase border border-amber-500/20">Best Value</div>
                    
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                            <Gem className="w-7 h-7 text-amber-300" />
                        </div>
                        <h3 className="text-2xl font-bold">Yearly Premium</h3>
                        <div className="mt-4 flex items-baseline">
                            <span className="text-5xl font-black tracking-tight">₹1200</span>
                            <span className="ml-2 text-indigo-300 font-medium">/ year</span>
                        </div>
                        <p className="mt-3 text-sm text-indigo-200 leading-relaxed">Save money and get a full year to connect with verified matches confidently.</p>
                        
                        <div className="my-8 h-px bg-gradient-to-r from-white/0 via-white/20 to-white/0"></div>
                        
                        <ul className="space-y-4 text-sm font-medium text-indigo-50">
                            {[
                                'Everything in Monthly', 
                                'Saves ₹2400/year', 
                                'Boosted profile visibility', 
                                'Dedicated matchmaking support'
                            ].map((feature, i) => (
                                <li key={i} className="flex gap-3 items-center">
                                    <div className="bg-amber-500/40 rounded-full p-1 shrink-0"><Check className="w-3 h-3 text-white" /></div> 
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="relative z-10 mt-10">
                        <button 
                            onClick={() => handleMakePayment(1200, 'Yearly Premium')}
                            disabled={processing || !profile || isActive}
                            className="w-full bg-white text-indigo-900 active:scale-95 hover:bg-indigo-50 font-bold py-4 rounded-2xl transition-all shadow-lg shadow-white/10 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {processing ? (
                                <div className="w-5 h-5 border-2 border-indigo-900 border-t-transparent rounded-full animate-spin"></div>
                            ) : isActive ? 'Renew Yearly' : 'Upgrade to Yearly'}
                        </button>
                        {!profile && <p className="text-center text-xs mt-3 text-indigo-200">Please submit bio-data first.</p>}
                    </div>
                </div>

            </div>
        </div>
    );
}
