'use client';

import { useEffect, useState } from 'react';
import api, { IMAGE_BASE_URL } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, MapPin, Calendar, Lock, Phone, User as UserIcon, Building2, Book, Award, Briefcase, ShieldCheck, AlertCircle, FileDown, Camera, Send } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';

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
        return <div className="p-8 flex justify-center items-center h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>;
    }

    if (!profile) {
        return (
            <div className="max-w-3xl mx-auto text-center mt-12 bg-white dark:bg-slate-900 p-12 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Profile Not Found</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">This profile might be inactive, locked, or doesn't exist.</p>
                <button onClick={() => router.back()} className="px-6 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors">
                    Go Back
                </button>
            </div>
        );
    }

    const isLocked = (val: string | undefined | null) => val === "Unlock to view";

    const FieldView = ({ label, value, icon, premium = false, className = "" }: { label: string, value: any, icon?: React.ReactNode, premium?: boolean, className?: string }) => {
        const locked = isLocked(value);

        return (
            <div className={`group p-4 rounded-2xl border transition-all duration-500 ${
                premium 
                    ? 'bg-gradient-to-br from-[hsl(230,25%,12%)] to-[hsl(230,25%,8%)] border-indigo-500/20 hover:border-indigo-500/40 shadow-[0_8px_32px_rgba(0,0,0,0.24)]' 
                    : 'bg-gradient-to-br from-[hsl(222,25%,10%)] to-[hsl(222,25%,7%)] border-slate-800/60 hover:border-slate-700 shadow-lg'
            } flex gap-4 items-start ${className}`}>
                {icon && (
                    <div className={`mt-0.5 p-2 rounded-xl ${
                        premium ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-400'
                    } group-hover:scale-110 transition-transform duration-500`}>
                        {icon}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <p className={`text-[10px] uppercase tracking-[0.15em] font-black ${
                        premium ? 'text-indigo-400/80' : 'text-slate-500'
                    } mb-1.5`}>{label}</p>
                    {locked ? (
                        <div className="flex items-center text-rose-400 font-bold text-[11px] bg-rose-500/10 px-2.5 py-1 rounded-lg w-fit border border-rose-500/20 backdrop-blur-sm">
                            <Lock className="w-3 h-3 mr-1.5" />
                            <span>Unlock to View</span>
                        </div>
                    ) : (
                        <p className="text-base text-slate-100 font-semibold truncate leading-tight tracking-tight">
                            {value || <span className="text-slate-600 font-normal italic">Not specified</span>}
                        </p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto pb-32 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Navigation Portal */}
            <div className="flex items-center justify-between mb-12">
                <button 
                    onClick={() => router.back()} 
                    className="group flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] hover:text-indigo-400 transition-all duration-500"
                >
                    <div className="w-10 h-10 border border-slate-800 rounded-2xl flex items-center justify-center group-hover:border-indigo-500/40 group-hover:bg-indigo-500/5 transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    Back to Matches
                </button>
            </div>

            {/* Core Identity Dossier (Hero) */}
            <div className="relative mb-16 rounded-[3.5rem] bg-slate-900 border border-slate-800/60 overflow-hidden shadow-2xl">
                {/* Architectural Mesh Gradient */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -mr-40 -mt-40" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] -ml-20 -mb-20" />
                
                <div className="relative z-10 px-10 md:px-16 pt-16 pb-12 flex flex-col lg:flex-row gap-12 lg:items-end">
                    {/* Visual ID Fragment */}
                    <div className="relative group shrink-0">
                        <div className="w-56 h-56 bg-slate-950 rounded-[3rem] border-4 border-slate-900 shadow-2xl flex items-center justify-center overflow-hidden relative ring-1 ring-slate-800">
                            {profile.photoUrl ? (
                                <img 
                                    src={`${IMAGE_BASE_URL}${profile.photoUrl}`} 
                                    alt={profile.fullName} 
                                    className={`w-full h-full object-cover transition-all duration-1000 ${!profile.isPhotoAccessible ? 'blur-3xl opacity-20 scale-150' : 'group-hover:scale-105'}`} 
                                />
                            ) : (
                                <UserIcon className="w-20 h-20 text-slate-800" />
                            )}
                            {!profile.isPhotoAccessible && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/60 backdrop-blur-xl">
                                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110">
                                        <Camera className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4">Private Photo</p>
                                    <button 
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            try {
                                                await api.post(`/profiles/${profile.id}/request-photo`);
                                                showToast('Photo access requested!', 'success');
                                            } catch (e) {
                                                showToast('Failed to request access', 'error');
                                            }
                                        }}
                                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all active:scale-95 shadow-xl shadow-indigo-600/20"
                                    >
                                        Request Access
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Meta Data Fragments */}
                    <div className="flex-1 space-y-8">
                        <div>
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">{profile.fullName}</h1>
                                {profile.verified && (
                                    <div className="px-4 py-1.5 bg-emerald-500 text-white rounded-full flex items-center gap-2 shadow-lg" title="Identity Verified">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Verified Profile</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-slate-400">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                    <span className="text-lg font-black text-white tracking-tight">{profile.formattedHeight || `${profile.height} cm`}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                                    <span className="text-lg font-black text-slate-300 tracking-tight">{profile.maritalStatus || 'Unmarried'}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                                    <span className="text-lg font-bold text-slate-500 tracking-tight capitalize">{profile.isManglik === 'YES' ? 'Kuja Dosha' : 'Non-Manglik'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Intel Bar */}
                        <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-800/60">
                            {isLocked(profile.contactNumber) ? (
                                <Link href="/dashboard/profile" className="px-10 py-4.5 bg-white text-slate-900 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-100 transition-all shadow-2xl flex items-center gap-3">
                                    <Lock className="w-4 h-4" /> Unlock Details
                                </Link>
                            ) : (
                                <div className="px-10 py-4.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-[1.5rem] font-black text-xl flex items-center gap-4 shadow-inner">
                                    <Phone className="w-6 h-6" /> {profile.contactNumber}
                                </div>
                            )}

                            {user?.id === profile?.user?.id && (
                                <button 
                                    onClick={async () => {
                                        try {
                                            const res = await api.get(`/profiles/${profile.id}/download-pdf`, { responseType: 'blob' });
                                            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                                            const link = document.createElement('a'); link.href = url;
                                            link.setAttribute('download', `Dossier_${profile.fullName.replace(/\s+/g, '_')}.pdf`);
                                            document.body.appendChild(link); link.click(); document.body.removeChild(link);
                                            window.URL.revokeObjectURL(url);
                                        } catch (e) {
                                            showToast('Download failed', 'error');
                                        }
                                    }}
                                    className="px-10 py-4.5 bg-slate-800 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-700 transition-all flex items-center gap-4 shadow-xl"
                                >
                                    <FileDown className="w-5 h-5 text-indigo-400" /> Download PDF
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Cultural Boundary Alert */}
                {profile.sameGotra && (
                    <div className="m-6 mt-0 p-8 bg-rose-500/5 border border-rose-500/20 rounded-[2rem] flex flex-col md:flex-row items-center gap-8 animate-pulse text-center md:text-left">
                        <div className="p-4 bg-rose-500/10 rounded-2xl">
                            <AlertCircle className="w-8 h-8 text-rose-500" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em]">Important Notice: Same Gotra</h4>
                            <p className="text-xl font-bold text-slate-100 tracking-tight">Same Gotra Detected: <span className="text-rose-500">{profile.gotra}</span></p>
                            <p className="text-sm text-slate-500 font-medium max-w-2xl">Lineage overlap identified. Cultural standards recommend external verification before engagement protocol.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Strategic Details Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Logical Core (Identity) */}
                <div className="space-y-12">
                    <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-[100%] transition-all duration-500 group-hover:bg-indigo-500/10" />
                        <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em] mb-12 flex items-center gap-4">
                            <UserIcon className="w-4 h-4" /> Personal Details
                        </h2>
                        <div className="grid gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FieldView label="Date of Birth" value={profile.dob} icon={<Calendar className="w-4.5 h-4.5" />} />
                                <FieldView label="Gotra" value={profile.gotra} icon={<div className="w-1.5 h-1.5 rounded-full bg-slate-400" />} />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <FieldView label="Birth Place" value={profile.birthPlace} />
                                <FieldView label="Birth Time" value={profile.birthTime} />
                            </div>
                            <FieldView label="Complexion" value={profile.complexion} />
                        </div>
                    </section>

                    <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-[100%] transition-all duration-500 group-hover:bg-purple-500/10" />
                        <h2 className="text-[10px] font-black text-purple-500 uppercase tracking-[0.5em] mb-12 flex items-center gap-4">
                            <Award className="w-4 h-4" /> Physical Attributes
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FieldView label="Wears Spectacles" value={profile.wearsSpectacles ? 'Yes' : 'No'} />
                            <FieldView label="Manglik Status" value={profile.isManglik} />
                        </div>
                    </section>
                </div>

                {/* Operations & Origin (Professional / Family) */}
                <div className="space-y-12">
                    <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-[100%] transition-all duration-500 group-hover:bg-emerald-500/10" />
                        <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em] mb-12 flex items-center gap-4">
                            <Briefcase className="w-4 h-4" /> Education & Career
                        </h2>
                        <div className="grid gap-6">
                            <FieldView label="Education" value={profile.education} icon={<Book className="w-4.5 h-4.5" />} />
                            <FieldView label="Occupation" value={profile.occupation} icon={<Building2 className="w-4.5 h-4.5" />} />
                            <FieldView premium label="Monthly Income" value={profile.monthlyIncome ? `₹${profile.monthlyIncome.toLocaleString()}` : null} />
                        </div>
                    </section>

                    <section className="bg-slate-900 rounded-[3rem] p-12 border border-slate-800/60 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-bl-[100%]" />
                        <h2 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] mb-12 flex items-center gap-4 relative z-10">
                            <Lock className="w-4 h-4 text-rose-500" /> Family Details
                        </h2>
                        <div className="grid gap-6 relative z-10">
                            <div className="grid md:grid-cols-2 gap-6">
                                <FieldView premium label="Father's Name" value={profile.fatherName} />
                                <FieldView premium label="Father's Occupation" value={profile.fatherOccupation} />
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <FieldView premium label="Mother's Name" value={profile.motherName} />
                                <FieldView premium label="Mother's Occupation" value={profile.motherOccupation} />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <FieldView premium label="Brother Count (M/U)" value={`${profile.brothersMarried || 0}/${profile.brothersUnmarried || 0}`} />
                                <FieldView premium label="Sister Count (M/U)" value={`${profile.sistersMarried || 0}/${profile.sistersUnmarried || 0}`} />
                            </div>
                            <FieldView 
                                premium 
                                label="Family Address" 
                                icon={<MapPin className="w-4.5 h-4.5" />}
                                value={isLocked(profile.familyAddress) ? profile.familyAddress : [profile.familyAddress, profile.familyCity, profile.familyState].filter(Boolean).join(', ')} 
                            />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );


}
