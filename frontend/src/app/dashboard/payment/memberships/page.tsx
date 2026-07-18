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
            const { data } = await api.post('/payments', { amount: amountInINR, currency: 'INR' });
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
                        await api.post(`/payments/${response.razorpay_order_id}/verify`, {
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
        <div className="max-w-7xl mx-auto pb-32 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Strategy Header */}
            <div className="text-center space-y-6 max-w-3xl mx-auto mb-20 relative">
                <div className="absolute inset-0 bg-indigo-500/5 blur-[120px] rounded-full -z-10" />
                <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.6em]">Premium Memberships</h4>
                <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none mb-6">Choose Your Plan.</h1>
                <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">Select the perfect membership plan to elevate your matchmaking experience.</p>
            </div>

            {/* System Status Portal */}
            {isActive && (
                <div className="max-w-5xl mx-auto px-4 mb-20">
                    <div className="bg-slate-900 border border-emerald-500/20 rounded-[2.5rem] p-8 flex items-center gap-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="shrink-0 w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-[1.5rem] flex items-center justify-center relative z-10 transition-transform group-hover:scale-110">
                            <Check className="w-8 h-8 text-emerald-400" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-1">Premium Membership Active</p>
                            <h3 className="text-2xl font-bold text-white tracking-tight">Account is upgraded</h3>
                            <p className="text-slate-500 font-medium mt-1">You have full access to all premium features and contact details.</p>
                        </div>
                        <div className="ml-auto hidden md:block">
                            <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Active Member</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tier Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto px-4 items-end">
                
                {/* Recon Tier (Basic) */}
                <div className="bg-slate-900 rounded-[3rem] p-12 border border-slate-800/60 flex flex-col justify-between h-[500px] opacity-60 grayscale-[80%] transition-all duration-700 hover:grayscale-0 hover:opacity-100 hover:border-slate-700 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800/10 rounded-bl-[100%] transition-all group-hover:bg-slate-800/20" />
                    <div>
                        <div className="w-14 h-14 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center mb-8">
                            <Shield className="w-7 h-7 text-slate-600" />
                        </div>
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Basic Plan</h3>
                        <div className="flex items-baseline text-white">
                            <span className="text-5xl font-black tracking-tighter">Free</span>
                        </div>
                        <ul className="mt-12 space-y-6">
                            {['Create Profile', 'Search Matches', 'Basic Profile View'].map((feature, i) => (
                                <li key={i} className="flex gap-4 items-center text-sm font-bold text-slate-500">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700 shrink-0" /> {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Tactical Tier (Monthly) */}
                <div className="bg-white rounded-[3rem] p-12 border border-slate-100 flex flex-col justify-between h-[600px] transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-[100%] transition-all group-hover:bg-indigo-500/10" />
                    <div>
                        <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-8">
                            <Star className="w-7 h-7" />
                        </div>
                        <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-4">Monthly Plan</h3>
                        <div className="flex items-baseline text-slate-950">
                            <span className="text-5xl font-black tracking-tighter">₹300</span>
                            <span className="ml-3 text-slate-400 font-bold uppercase text-[10px] tracking-widest">/ Month</span>
                        </div>
                        <ul className="mt-10 space-y-6">
                            {['View Contact Details', 'Express Interest', 'Priority Support', 'Premium Badge'].map((feature, i) => (
                                <li key={i} className="flex gap-4 items-center text-sm font-bold text-slate-600">
                                    <Check className="w-5 h-5 text-indigo-500 shrink-0" /> {feature}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-100">
                        <button 
                            onClick={() => handleMakePayment(300, 'Monthly Flex')}
                            disabled={processing || !profile || isActive}
                            className="w-full py-5 bg-slate-950 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95 disabled:opacity-30 hover:bg-indigo-600 shadow-2xl flex items-center justify-center gap-3"
                        >
                            {processing ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : isActive ? 'Renew Monthly' : 'Choose Monthly'}
                        </button>
                    </div>
                </div>

                {/* Sovereign Tier (Yearly) */}
                <div className="bg-slate-950 rounded-[3.5rem] p-12 lg:p-14 border border-indigo-500/30 flex flex-col justify-between h-[700px] transition-all duration-700 hover:-translate-y-4 hover:border-indigo-500/60 shadow-[0_40px_100px_rgba(79,70,229,0.3)] relative overflow-hidden group">
                    {/* Visual Energy */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[80px] -mr-40 -mt-40 transition-all duration-1000 group-hover:scale-125" />
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                            <div className="w-16 h-16 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                                <Gem className="w-8 h-8 text-amber-300" />
                            </div>
                            <div className="px-5 py-2 bg-amber-500 text-white rounded-full text-[10px] font-black tracking-[0.3em] uppercase shadow-lg shadow-amber-500/20">Best Value</div>
                        </div>
                        
                        <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] mb-4">Yearly Plan</h3>
                        <div className="flex items-baseline text-white">
                            <span className="text-7xl font-black tracking-tighter">₹1200</span>
                            <span className="ml-4 text-indigo-300 font-bold uppercase text-xs tracking-widest">/ Year</span>
                        </div>
                        <p className="mt-6 text-slate-400 font-medium leading-relaxed max-w-[240px]">Get the maximum value and uninterrupted premium access for an entire year.</p>
                        
                        <ul className="mt-12 space-y-6">
                            {[
                                'All Monthly Features', 
                                'Save 66% Annually', 
                                'Highlighted Profile', 
                                'Dedicated Support'
                            ].map((feature, i) => (
                                <li key={i} className="flex gap-4 items-center text-sm font-black text-indigo-50 tracking-tight">
                                    <div className="w-6 h-6 bg-indigo-500/20 border border-indigo-500/30 rounded-lg flex items-center justify-center shrink-0">
                                        <Check className="w-3.5 h-3.5 text-indigo-400" />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="relative z-10 mt-12">
                        <button 
                            onClick={() => handleMakePayment(1200, 'Yearly Premium')}
                            disabled={processing || !profile || isActive}
                            className="w-full py-6 bg-white text-slate-950 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.4em] transition-all hover:scale-[1.03] active:scale-100 disabled:opacity-30 shadow-2xl flex items-center justify-center gap-4"
                        >
                            {processing ? (
                                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                            ) : isActive ? 'Renew Yearly' : 'Choose Yearly'}
                        </button>
                        {!profile && <p className="text-center text-[10px] mt-6 text-slate-500 font-black uppercase tracking-widest">Submit Bio-Data to Upgrade</p>}
                    </div>
                </div>

            </div>
        </div>
    );

}
