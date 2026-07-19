'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Check, CheckCircle, X } from 'lucide-react';
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
                    color: "#C62828"
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
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
            </div>
        );
    }

    const isActive = profile?.membershipStatus?.name === 'ACTIVE';

    const spinner = <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />;

    return (
        <div className="pb-12">
            <header className="mb-6">
                <p className="text-xs text-faint">Payments / <span className="font-medium text-muted-foreground">Memberships</span></p>
                <h1 className="mt-1 text-[21px] font-semibold tracking-tight text-foreground">Membership plans</h1>
                <p className="mt-0.5 text-[13px] text-muted-foreground">Contact details and interests unlock with an active membership.</p>
            </header>

            {isActive && (
                <div className="mb-5 flex items-center gap-3 rounded-[10px] border border-success/40 bg-success-subtle px-4 py-3">
                    <CheckCircle className="h-4.5 w-4.5 shrink-0 text-success" aria-hidden />
                    <p className="text-[13px] text-foreground">
                        <span className="font-semibold">Premium membership active.</span> You have full access to all premium features and contact details.
                    </p>
                </div>
            )}

            {!profile && (
                <div className="mb-5 flex items-center gap-3 rounded-[10px] border border-info/40 bg-info-subtle px-4 py-3">
                    <p className="text-[13px] text-info">
                        <span className="font-semibold">Bio-data required.</span> Submit your bio-data before choosing a plan.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-3">
                {/* Basic */}
                <div className="flex flex-col rounded-xl border border-border bg-surface p-5 shadow-card">
                    <h3 className="text-[13px] font-semibold text-foreground">Basic</h3>
                    <p className="mt-2 text-[26px] font-semibold tracking-tight text-foreground">Free</p>
                    <p className="mt-0.5 text-[12.5px] text-muted-foreground">Create a profile and browse.</p>
                    <ul className="mt-4 space-y-2 border-t border-border pt-4">
                        {['Create profile', 'Search matches', 'Basic profile view'].map((feature) => (
                            <li key={feature} className="flex items-start gap-2 text-[13px] text-muted-foreground">
                                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" aria-hidden /> {feature}
                            </li>
                        ))}
                        {['View contact details', 'Express interest'].map((feature) => (
                            <li key={feature} className="flex items-start gap-2 text-[13px] text-faint">
                                <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-border-strong" aria-hidden /> {feature}
                            </li>
                        ))}
                    </ul>
                    <button
                        disabled
                        className="mt-auto w-full cursor-not-allowed rounded-lg border border-border-strong bg-surface px-4 py-2.5 text-[13px] font-semibold text-foreground opacity-50 pt-5"
                    >
                        Included with every account
                    </button>
                </div>

                {/* Monthly */}
                <div className="flex flex-col rounded-xl border border-border bg-surface p-5 shadow-card">
                    <h3 className="text-[13px] font-semibold text-foreground">Monthly</h3>
                    <p className="mt-2 text-[26px] font-semibold tracking-tight text-foreground tabular-nums">
                        ₹300 <span className="text-[12.5px] font-medium text-faint">/ month</span>
                    </p>
                    <p className="mt-0.5 text-[12.5px] text-muted-foreground">Full access, month to month.</p>
                    <ul className="mt-4 space-y-2 border-t border-border pt-4">
                        {['View contact details', 'Express interest', 'Priority support', 'Premium badge'].map((feature) => (
                            <li key={feature} className="flex items-start gap-2 text-[13px] text-muted-foreground">
                                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" aria-hidden /> {feature}
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={() => handleMakePayment(300, 'Monthly Flex')}
                        disabled={processing || !profile}
                        className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg border border-border-strong bg-surface px-4 py-2.5 pt-5 text-[13px] font-semibold text-foreground transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {processing ? spinner : isActive ? 'Renew monthly' : 'Choose monthly'}
                    </button>
                </div>

                {/* Yearly */}
                <div className="relative flex flex-col rounded-xl border border-premium bg-surface p-5 shadow-lifted">
                    <span className="absolute -top-2.5 left-4 rounded-full bg-premium-subtle px-2.5 py-0.5 text-[11.5px] font-semibold text-premium">
                        ★ Best value · save 66%
                    </span>
                    <h3 className="text-[13px] font-semibold text-foreground">Yearly</h3>
                    <p className="mt-2 text-[26px] font-semibold tracking-tight text-foreground tabular-nums">
                        ₹1,200 <span className="text-[12.5px] font-medium text-faint">/ year</span>
                    </p>
                    <p className="mt-0.5 text-[12.5px] text-muted-foreground">Everything in Monthly, for a full year.</p>
                    <ul className="mt-4 space-y-2 border-t border-border pt-4">
                        {['All monthly features', 'Highlighted profile', 'Dedicated support', 'Uninterrupted access'].map((feature) => (
                            <li key={feature} className="flex items-start gap-2 text-[13px] text-muted-foreground">
                                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" aria-hidden /> {feature}
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={() => handleMakePayment(1200, 'Yearly Premium')}
                        disabled={processing || !profile}
                        className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 pt-5 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {processing ? spinner : isActive ? 'Renew yearly' : 'Choose yearly'}
                    </button>
                </div>
            </div>

            <p className="mt-4 text-xs text-faint">
                Payments are processed securely through Razorpay. A GST invoice is emailed after every transaction.
            </p>
        </div>
    );
}
