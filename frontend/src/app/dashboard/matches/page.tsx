'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Search, MapPin, User as UserIcon, Calendar, Lock, Briefcase, GraduationCap } from 'lucide-react';
import Link from 'next/link';

interface BioData {
    id: number;
    fullName: string;
    gender: string;
    maritalStatus: string;
    contactNumber: string;
    dob: string;
    familyCity: string;
    familyState: string;
    familyAddress: string;
    education: string;
    occupation: string;
    monthlyIncome: number;
    height: string;
    fatherName: string;
    motherName: string;
    photoUrl: string;
}

export default function MatchesPage() {
    const { user } = useAuth();
    const [matches, setMatches] = useState<BioData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const res = await api.get('/profiles');
                if (res.data?.data?.content) {
                    setMatches(res.data.data.content);
                }
            } catch (error) {
                console.error("Failed to fetch matches", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, []);

    const isLocked = (val: string | undefined | null) => {
        return val === "Unlock to view";
    };

    const renderField = (value: string | undefined | null, icon: React.ReactNode, fallback: string = "Not specified") => {
        if (!value) return (
            <div className="flex items-center text-gray-400 dark:text-gray-500 text-sm">
                {icon} <span className="ml-2 italic">{fallback}</span>
            </div>
        );

        if (isLocked(value)) {
            return (
                <div className="flex items-center text-rose-500 font-medium text-sm bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-md w-fit">
                    <Lock className="w-3 h-3 mr-1" />
                    <span className="blur-[2px] opacity-70 select-none mr-2">Locked</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">Unlock</span>
                </div>
            );
        }

        return (
            <div className="flex items-center text-gray-700 dark:text-gray-300 text-sm">
                {icon} <span className="ml-2">{value}</span>
            </div>
        );
    };

    if (loading) {
        return <div className="p-8 flex justify-center items-center h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>;
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Discover Matches</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Found {matches.length} active profiles</p>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by name or city..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                </div>
            </div>

            {matches.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-12 text-center">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Matches Found</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">We couldn't find any active profiles at the moment. Please check back later.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {matches.map((match) => (
                        <div key={match.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                            {/* Card Header relative */}
                            <div className="h-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 relative">
                                <div className="absolute -bottom-10 left-6">
                                    <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center border-4 border-white dark:border-slate-800 transform rotate-3 transition-transform group-hover:rotate-0 overflow-hidden">
                                        {match.photoUrl ? (
                                            <img src={`http://localhost:8081${match.photoUrl}`} alt={match.fullName} className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon className="w-10 h-10 text-gray-300 dark:text-gray-500" />
                                        )}
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-md uppercase tracking-wider">
                                    {match.maritalStatus || 'Single'}
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="pt-12 pb-6 px-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">{match.fullName}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{match.height ? `${match.height} • ` : ''}{match.gender || 'Not specified'}</p>

                                <div className="space-y-3 flex-1 border-t border-gray-50 dark:border-slate-800/50 pt-4">
                                    {renderField(match.dob, <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />)}
                                    {renderField(
                                        [match.familyCity, match.familyState].filter(Boolean).join(', '),
                                        <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />,
                                        "Location not specified"
                                    )}
                                    {renderField(match.education, <GraduationCap className="w-4 h-4 text-gray-400 dark:text-gray-500" />, "Education unseen")}
                                    {renderField(match.occupation, <Briefcase className="w-4 h-4 text-gray-400 dark:text-gray-500" />, "Occupation unseen")}

                                    <div className="mt-2 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Premium Info</p>
                                        <div className="space-y-2">
                                            {renderField(match.contactNumber, <span className="text-gray-400 dark:text-gray-500 w-4 h-4 flex items-center justify-center text-xs">📞</span>)}
                                            {renderField(match.fatherName ? `Father: ${match.fatherName}` : null, <span className="text-gray-400 dark:text-gray-500 w-4 h-4 flex items-center justify-center text-xs">👨</span>)}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 flex gap-3">
                                    <Link href={`/dashboard/matches/${match.id}`} className="flex-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-center py-2.5 rounded-lg font-medium text-sm hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
                                        View Full Profile
                                    </Link>

                                    {isLocked(match.contactNumber) && (
                                        <Link href="/dashboard/profile" className="flex-1 bg-gray-900 dark:bg-slate-700 text-white text-center py-2.5 rounded-lg font-medium text-sm hover:bg-black dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2">
                                            <Lock className="w-4 h-4" /> Unlock
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
