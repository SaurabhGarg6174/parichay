'use client';

import { useEffect, useState } from 'react';
import api, { IMAGE_BASE_URL } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Lock, Phone, User as UserIcon, ShieldCheck, AlertCircle, FileDown, Camera } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="rounded-xl border border-border bg-surface shadow-card">
        <div className="border-b border-border px-5 py-3.5">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        <div className="px-5 py-1.5">{children}</div>
    </section>
);

export default function MatchDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get(`/profiles/${params.id}`);
                if (res.data?.data) {
                    setProfile(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="mx-auto mt-12 max-w-md rounded-xl border border-border bg-surface px-6 py-12 text-center shadow-card">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
                    <UserIcon className="h-6 w-6 text-faint" aria-hidden />
                </span>
                <h2 className="mt-4 text-[15px] font-semibold text-foreground">Profile not found</h2>
                <p className="mt-1 text-[13px] text-muted-foreground">This profile might be inactive, private, or no longer exists.</p>
                <button
                    onClick={() => router.back()}
                    className="mt-5 rounded-lg border border-border-strong bg-surface px-4 py-2 text-[13px] font-semibold text-foreground transition-colors hover:bg-surface-hover"
                >
                    Go back
                </button>
            </div>
        );
    }

    const isLocked = (val: string | undefined | null) => val === "Unlock to view";

    const KV = ({ label, value, wide = false }: { label: string; value: any; wide?: boolean }) => (
        <div className={`border-b border-border py-2.5 last:border-b-0 ${wide ? 'sm:col-span-2' : ''}`}>
            <p className="text-[11.5px] text-faint">{label}</p>
            {isLocked(value) ? (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-warning-subtle px-2 py-0.5 text-[11px] font-semibold text-warning">
                    <Lock className="h-3 w-3" aria-hidden /> Members only
                </span>
            ) : (
                <p className="mt-0.5 text-[13.5px] font-medium text-foreground">
                    {value || <span className="font-normal text-faint">Not specified</span>}
                </p>
            )}
        </div>
    );

    const address = isLocked(profile.familyAddress)
        ? profile.familyAddress
        : [profile.familyAddress, profile.familyCity, profile.familyState].filter(Boolean).join(', ');

    return (
        <div className="mx-auto max-w-5xl space-y-4 pb-12">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4" aria-hidden /> Back to matches
            </button>

            {/* Identity card */}
            <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
                <div className="flex flex-col gap-5 sm:flex-row">
                    <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-muted">
                        {profile.photoUrl ? (
                            <img
                                src={`${IMAGE_BASE_URL}${profile.photoUrl}`}
                                alt={profile.fullName}
                                className={`h-full w-full object-cover ${!profile.isPhotoAccessible ? 'scale-125 opacity-30 blur-lg' : ''}`}
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center">
                                <UserIcon className="h-10 w-10 text-faint" aria-hidden />
                            </div>
                        )}
                        {!profile.isPhotoAccessible && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-2 text-center">
                                <Camera className="h-4 w-4 text-muted-foreground" aria-hidden />
                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        try {
                                            await api.post(`/profiles/${profile.id}/photo-requests`);
                                            showToast('Photo access requested!', 'success');
                                        } catch (e) {
                                            showToast('Failed to request access', 'error');
                                        }
                                    }}
                                    className="rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-primary-hover"
                                >
                                    Request photo
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-[19px] font-semibold tracking-tight text-foreground">{profile.fullName}</h1>
                            {profile.verified && (
                                <span className="flex items-center gap-1 rounded-full bg-success-subtle px-2.5 py-0.5 text-[11.5px] font-semibold text-success">
                                    <ShieldCheck className="h-3 w-3" aria-hidden /> Verified
                                </span>
                            )}
                        </div>
                        <p className="mt-1 text-[13px] text-muted-foreground">
                            {[
                                profile.formattedHeight || (profile.height ? `${profile.height} cm` : null),
                                profile.maritalStatus || 'Unmarried',
                                profile.isManglik === 'YES' ? 'Manglik' : 'Non-Manglik',
                                profile.familyCity,
                            ].filter(Boolean).join(' · ')}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                            {isLocked(profile.contactNumber) ? (
                                <Link
                                    href="/dashboard/payment/memberships"
                                    className="flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover"
                                >
                                    <Lock className="h-4 w-4" aria-hidden /> Unlock contact details
                                </Link>
                            ) : (
                                <span className="flex items-center gap-2 rounded-lg bg-success-subtle px-3.5 py-2 text-[13.5px] font-semibold text-success tabular-nums">
                                    <Phone className="h-4 w-4" aria-hidden /> {profile.contactNumber}
                                </span>
                            )}

                            {user?.id === profile?.user?.id && (
                                <button
                                    onClick={async () => {
                                        try {
                                            const res = await api.get(`/profiles/${profile.id}/pdf`, { responseType: 'blob' });
                                            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                                            const link = document.createElement('a'); link.href = url;
                                            link.setAttribute('download', `Biodata_${profile.fullName.replace(/\s+/g, '_')}.pdf`);
                                            document.body.appendChild(link); link.click(); document.body.removeChild(link);
                                            window.URL.revokeObjectURL(url);
                                        } catch (e) {
                                            showToast('Download failed', 'error');
                                        }
                                    }}
                                    className="flex items-center gap-2 rounded-lg border border-border-strong bg-surface px-3.5 py-2 text-[13px] font-semibold text-foreground transition-colors hover:bg-surface-hover"
                                >
                                    <FileDown className="h-4 w-4 text-muted-foreground" aria-hidden /> Download PDF
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Same-gotra notice */}
                {profile.sameGotra && (
                    <div className="mt-4 flex items-start gap-3 rounded-[10px] border border-warning/40 bg-warning-subtle px-4 py-3">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
                        <div>
                            <p className="text-[13px] font-semibold text-foreground">Same gotra: {profile.gotra}</p>
                            <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                                Both families share the same gotra. Please verify with your family elders before proceeding.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                    <SectionCard title="Personal details">
                        <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                            <KV label="Date of birth" value={profile.dob} />
                            <KV label="Gotra" value={profile.gotra} />
                            <KV label="Birth place" value={profile.birthPlace} />
                            <KV label="Birth time" value={profile.birthTime} />
                            <KV label="Complexion" value={profile.complexion} />
                        </div>
                    </SectionCard>

                    <SectionCard title="Physical attributes">
                        <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                            <KV label="Wears spectacles" value={profile.wearsSpectacles ? 'Yes' : 'No'} />
                            <KV label="Manglik status" value={profile.isManglik} />
                        </div>
                    </SectionCard>
                </div>

                <div className="space-y-4">
                    <SectionCard title="Education & career">
                        <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                            <KV label="Education" value={profile.education} />
                            <KV label="Occupation" value={profile.occupation} />
                            <KV label="Monthly income" value={profile.monthlyIncome ? `₹${profile.monthlyIncome.toLocaleString()}` : null} wide />
                        </div>
                    </SectionCard>

                    <SectionCard title="Family details">
                        <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                            <KV label="Father's name" value={profile.fatherName} />
                            <KV label="Father's occupation" value={profile.fatherOccupation} />
                            <KV label="Mother's name" value={profile.motherName} />
                            <KV label="Mother's occupation" value={profile.motherOccupation} />
                            <KV label="Brothers (married / unmarried)" value={`${profile.brothersMarried || 0} / ${profile.brothersUnmarried || 0}`} />
                            <KV label="Sisters (married / unmarried)" value={`${profile.sistersMarried || 0} / ${profile.sistersUnmarried || 0}`} />
                            <KV label="Family address" value={address} wide />
                        </div>
                    </SectionCard>
                </div>
            </div>
        </div>
    );
}
