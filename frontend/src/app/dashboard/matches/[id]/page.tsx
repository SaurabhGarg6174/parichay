'use client';

import { useEffect, useState } from 'react';
import api, { IMAGE_BASE_URL } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, Lock, Phone, User as UserIcon, Building2, Book, Award, Briefcase, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function MatchDetailPage() {
    const params = useParams();
    const router = useRouter();
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

    const FieldView = ({ label, value, icon, premium = false }: { label: string, value: any, icon?: React.ReactNode, premium?: boolean }) => {
        const locked = isLocked(value);

        return (
            <div className={`p-4 rounded-xl border ${premium ? 'bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20' : 'bg-gray-50/50 dark:bg-slate-800/50 border-gray-100/50 dark:border-slate-700/50'} flex gap-3`}>
                {icon && <div className={`mt-1 ${premium ? 'text-indigo-400 dark:text-indigo-300' : 'text-gray-400 dark:text-gray-500'}`}>{icon}</div>}
                <div className="flex-1">
                    <p className={`text-sm font-medium ${premium ? 'text-indigo-600/70 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'} mb-1`}>{label}</p>
                    {locked ? (
                        <div className="flex items-center text-rose-500 font-medium text-sm bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-md w-fit">
                            <Lock className="w-3 h-3 mr-1" />
                            <span className="blur-[2px] opacity-70 select-none mr-2">Locked Data</span>
                            <span className="text-xs font-semibold uppercase tracking-wider">Unlock</span>
                        </div>
                    ) : (
                        <p className="text-base text-gray-900 dark:text-gray-100 font-semibold">{value || <span className="text-gray-400 dark:text-gray-500 italic">Not specified</span>}</p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <button onClick={() => router.back()} className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to matches
            </button>

            {/* Header Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden mb-6 relative">
                <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600"></div>

                <div className="px-8 pb-8 flex flex-col sm:flex-row gap-6 items-start relative">
                    <div className="w-32 h-32 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-4 border-white dark:border-slate-800 flex items-center justify-center -mt-16 flex-shrink-0 relative z-10 overflow-hidden">
                        {profile.photoUrl ? (
                            <img src={`${IMAGE_BASE_URL}${profile.photoUrl}`} alt={profile.fullName} className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-16 h-16 text-gray-300 dark:text-gray-500" />
                        )}
                    </div>

                    <div className="flex-1 pt-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{profile.fullName}</h1>
                                    {profile.verified && (
                                        <div title="Verified Profile">
                                            <ShieldCheck className="w-6 h-6 text-emerald-500" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-lg text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                    {profile.height ? `${profile.height} • ` : ''}{profile.gender || 'Not specified'}
                                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">{profile.maritalStatus || 'Single'}</span>
                                </p>
                            </div>

                            {isLocked(profile.contactNumber) ? (
                                <Link href="/dashboard/profile" className="px-6 py-2.5 bg-gray-900 dark:bg-slate-700 text-white text-center rounded-xl font-medium hover:bg-black dark:hover:bg-slate-600 transition-colors flex items-center gap-2 shadow-lg shadow-gray-200 dark:shadow-none">
                                    <Lock className="w-4 h-4" /> Unlock Premium Info
                                </Link>
                            ) : (
                                <div className="px-6 py-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400 rounded-xl font-medium flex items-center gap-2">
                                    <Phone className="w-4 h-4" /> {profile.contactNumber}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 p-8">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                            <UserIcon className="w-5 h-5 text-indigo-500" /> Personal Details
                        </h2>
                        <div className="space-y-4">
                            <FieldView label="Date of Birth" value={profile.dob} icon={<Calendar className="w-5 h-5" />} />
                            <FieldView label="Birth Time" value={profile.birthTime} />
                            <FieldView label="Birth Place" value={profile.birthPlace} />
                            <FieldView label="Gotra" value={profile.gotra} />
                            <FieldView
                                label="Manglik Status"
                                value={<span className="capitalize">{profile.isManglik || 'No'}</span>}
                            />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 p-8">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                            <Award className="w-5 h-5 text-purple-500" /> Physical Attributes
                        </h2>
                        <div className="space-y-4">
                            <FieldView label="Complexion" value={profile.complexion} />
                            <FieldView label="Wears Spectacles" value={profile.wearsSpectacles ? 'Yes' : 'No'} />
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 p-8">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-blue-500" /> Professional Details
                        </h2>
                        <div className="space-y-4">
                            <FieldView label="Education" value={profile.education} icon={<Book className="w-5 h-5" />} />
                            <FieldView label="Occupation" value={profile.occupation} icon={<Building2 className="w-5 h-5" />} />
                            <FieldView label="Monthly Income" value={profile.monthlyIncome ? `₹${profile.monthlyIncome}` : ''} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-500/10 rounded-bl-full -z-0 opacity-50"></div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 relative z-10 flex items-center gap-2">
                            <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            Family & Contact Context (Premium)
                        </h2>
                        <div className="space-y-4 relative z-10">
                            <FieldView premium label="Father's Name" value={profile.fatherName ? `Father: ${profile.fatherName}` : null} />
                            <FieldView premium label="Father's Occupation" value={profile.fatherOccupation} />
                            <FieldView premium label="Mother's Name" value={profile.motherName ? `Mother: ${profile.motherName}` : null} />
                            <FieldView premium label="Mother's Occupation" value={profile.motherOccupation} />

                            <div className="grid grid-cols-2 gap-4">
                                <FieldView premium label="Bros (M / U)" value={`${profile.brothersMarried || 0} / ${profile.brothersUnmarried || 0}`} />
                                <FieldView premium label="Sis (M / U)" value={`${profile.sistersMarried || 0} / ${profile.sistersUnmarried || 0}`} />
                            </div>

                            <FieldView
                                premium
                                label="Complete Family Address"
                                value={
                                    isLocked(profile.familyAddress)
                                        ? profile.familyAddress // The string "Unlock to view"
                                        : `${profile.familyAddress || ''}, ${profile.familyCity || ''}, ${profile.familyState || ''}, ${profile.familyCountry || ''}`.replace(/^[,\s]+|[,\s]+$/g, '').replace(/,\s*,/g, ',')
                                }
                                icon={<MapPin className="w-5 h-5" />}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
