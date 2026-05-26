'use client';

import { useEffect, useState, useCallback } from 'react';
import api, { IMAGE_BASE_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
    Search, MapPin, User as UserIcon, Calendar, Lock, Briefcase, GraduationCap,
    Filter, ChevronLeft, ChevronRight, X, SlidersHorizontal, Heart, ShieldCheck, Award, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import Modal from '@/components/Modal';
import { useToast } from '@/context/ToastContext';
import SuccessStories from '@/components/SuccessStories';

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
    gotra: string;
    isManglik: string;
    verified: boolean;
    isCommunityVerified: boolean;
    sameGotra: boolean;
    isPhotoHidden: boolean;
    isPhotoAccessible: boolean;
    formattedHeight: string;
    formattedWeight: string;
}

interface SearchFilters {
    name: string;
    gotra: string;
    gender: string;
    minAge: string;
    maxAge: string;
    education: string;
    city: string;
    isManglik: string;
}

const INITIAL_FILTERS: SearchFilters = {
    name: '', gotra: '', gender: '', minAge: '', maxAge: '',
    education: '', city: '', isManglik: ''
};

export default function MatchesPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [matches, setMatches] = useState<BioData[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<SearchFilters>(INITIAL_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState<SearchFilters>(INITIAL_FILTERS);
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [availableActions, setAvailableActions] = useState<any[]>([]);
    const [lookups, setLookups] = useState<Record<string, any[]>>({});
    const [shortlistModal, setShortlistModal] = useState<{ isOpen: boolean, profileName: string, ad?: any }>({
        isOpen: false,
        profileName: ''
    });

    useEffect(() => {
        const fetchLookups = async () => {
            try {
                const res = await api.get('/metadata/lookups');
                if (res.data?.data) {
                    setLookups(res.data.data);
                }
            } catch (error: any) {
                showToast(error.response?.data?.message || 'Failed to fetch lookups', 'error');
            }
        };
        fetchLookups();
    }, []);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const fetchMatches = useCallback(async (currentFilters: SearchFilters, currentPage: number) => {

        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', currentPage.toString());
            params.set('size', '12');

            if (currentFilters.name) params.set('name', currentFilters.name);
            if (currentFilters.gotra) params.set('gotra', currentFilters.gotra);
            if (currentFilters.gender) params.set('gender', currentFilters.gender);
            if (currentFilters.minAge) params.set('minAge', currentFilters.minAge);
            if (currentFilters.maxAge) params.set('maxAge', currentFilters.maxAge);
            if (currentFilters.education) params.set('education', currentFilters.education);
            if (currentFilters.city) params.set('city', currentFilters.city);
            if (currentFilters.isManglik) params.set('isManglik', currentFilters.isManglik);

            const hasFilters = Object.values(currentFilters).some(v => v !== '');
            const endpoint = hasFilters ? '/profiles/search' : '/profiles';

            const res = await api.get(`${endpoint}?${params.toString()}`);
            if (res.data?.data) {
                setMatches(res.data.data.content || []);
                setTotalPages(res.data.data.totalPages || 0);
                setTotalElements(res.data.data.totalElements || 0);
                setAvailableActions(res.data.data.actions || []);
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to fetch matches', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchMatches(appliedFilters, page);
    }, [appliedFilters, page, fetchMatches]);

    const handleApplyFilters = () => {
        setAppliedFilters({ ...filters });
        setPage(0);
        setShowFilters(false);
    };

    const handleClearFilters = () => {
        setFilters(INITIAL_FILTERS);
        setAppliedFilters(INITIAL_FILTERS);
        setPage(0);
    };

    const activeFilterCount = Object.values(appliedFilters).filter(v => v !== '').length;

    const formatShortName = (name: string) => {
        if (!name) return "";
        const parts = name.trim().split(/\s+/);
        if (parts.length <= 2) return name;
        return `${parts[0]} ${parts[parts.length - 1]}`;
    };

    const isLocked = (val: string | undefined | null) => val === "Unlock to view";

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

    return (
        <div className="space-y-12 animate-in fade-in duration-1000">
            <SuccessStories />
            
            {/* Header / Search Portal */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 pb-8 border-b border-slate-200 dark:border-slate-800/60">
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Find Your Partner</p>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Discover Matches</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold transition-all">
                        {loading ? 'Loading profiles...' : `${totalElements} matches found`}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                    <div className="relative flex-1 sm:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={filters.name}
                            onChange={e => setFilters(prev => ({ ...prev, name: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && handleApplyFilters()}
                            className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm group-hover:shadow-md transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl border font-black text-xs uppercase tracking-widest transition-all ${showFilters || activeFilterCount > 0
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-[0_8px_20px_rgba(79,70,229,0.3)]'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm'
                            }`}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="bg-white text-indigo-600 text-[10px] px-2 py-0.5 rounded-full font-black ml-1">{activeFilterCount}</span>
                        )}
                    </button>
                </div>
            </div>

            {/* Filter Hub */}
            {showFilters && (
                <div className="glass-dark rounded-[2.5rem] p-10 mb-12 animate-in slide-in-from-top-4 duration-500 border border-slate-800/40">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                                <Filter className="w-4 h-4 text-indigo-400" />
                            </div>
                            Filter Matches
                        </h3>
                        <button onClick={() => setShowFilters(false)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { label: 'Gotra', name: 'gotra', options: lookups['GOTRA'] },
                            { label: 'Gender', name: 'gender', options: lookups['GENDER'] },
                            { label: 'Education', name: 'education', options: lookups['EDUCATION'] },
                            { label: 'Manglik', name: 'isManglik', options: lookups['MANGLIK_STATUS'] }
                        ].map((field) => (
                            <div key={field.name} className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{field.label}</label>
                                <select
                                    name={field.name}
                                    value={filters[field.name as keyof SearchFilters]}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800/50 border border-slate-700/50 text-white px-4 py-3.5 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all appearance-none"
                                >
                                    <option value="">Any</option>
                                    {(field.options || []).map(l => <option key={l.id} value={l.label} className="bg-slate-900">{l.label}</option>)}
                                </select>
                            </div>
                        ))}

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Location / City</label>
                            <input
                                name="city"
                                value={filters.city}
                                onChange={handleChange}
                                placeholder="Any Region"
                                className="w-full bg-slate-800/50 border border-slate-700/50 text-white px-4 py-3.5 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Age Span (Min)</label>
                            <input
                                type="number"
                                name="minAge"
                                value={filters.minAge}
                                onChange={handleChange}
                                placeholder="18"
                                className="w-full bg-slate-800/50 border border-slate-700/50 text-white px-4 py-3.5 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Age Span (Max)</label>
                            <input
                                type="number"
                                name="maxAge"
                                value={filters.maxAge}
                                onChange={handleChange}
                                placeholder="70"
                                className="w-full bg-slate-800/50 border border-slate-700/50 text-white px-4 py-3.5 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-12 pt-8 border-t border-slate-800/40">
                        <button
                            onClick={handleClearFilters}
                            className="px-6 py-3.5 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-white transition-colors"
                        >
                            Clear Filters
                        </button>
                        <button
                            onClick={handleApplyFilters}
                            className="px-10 py-3.5 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Loading / Results Context */}
            {loading ? (
                <div className="p-20 flex flex-col justify-center items-center gap-6">
                    <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Loading profiles...</p>
                </div>
            ) : matches.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-24 text-center border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px]" />
                    <div className="relative z-10 max-w-md mx-auto">
                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <UserIcon className="w-10 h-10 text-slate-300 dark:text-slate-500" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-4 uppercase">No Matches Found</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-bold mb-10 leading-relaxed">
                            Adjust your filters to discover more matching profiles.
                        </p>
                        <button onClick={handleClearFilters} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
                            Clear All Filters
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                        {matches.map((match) => (
                            <div key={match.id} className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/60 overflow-hidden hover:shadow-2xl hover:-translate-y-3 transition-all duration-700 flex flex-col relative">
                                {/* Card Header / Visual ID */}
                                <div className="h-32 bg-slate-900 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-transparent to-transparent opacity-60" />
                                    <div className="absolute -bottom-12 left-10">
                                        <div className={`w-28 h-28 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-4 border-white dark:border-slate-900 flex items-center justify-center overflow-hidden relative`}>
                                            {match.photoUrl ? (
                                                <img 
                                                    src={`${IMAGE_BASE_URL}${match.photoUrl}`} 
                                                    alt={match.fullName} 
                                                    className={`w-full h-full object-cover transition-all duration-1000 ${!match.isPhotoAccessible ? 'blur-3xl opacity-30 scale-150' : 'group-hover:scale-110'}`} 
                                                />
                                            ) : (
                                                <UserIcon className="w-12 h-12 text-slate-200 dark:text-slate-700" />
                                            )}
                                            {!match.isPhotoAccessible && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-md">
                                                    <Lock className="w-8 h-8 text-white/50" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="absolute top-6 right-6 flex items-center gap-2">
                                        <div className="bg-indigo-500 text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg">
                                            {match.maritalStatus}
                                        </div>
                                        {match.verified && (
                                            <div className="bg-emerald-500 p-1.5 rounded-lg shadow-lg">
                                                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Card Body / Identity Fragments */}
                                <div className="pt-20 pb-10 px-10 flex-1 flex flex-col">
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-2 gap-2">
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter truncate flex-1 min-w-0">{formatShortName(match.fullName)}</h3>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0 max-w-[40%] truncate">{match.gotra}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {match.isCommunityVerified && (
                                                <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-500 px-2 py-0.5 rounded-md border border-amber-500/20">
                                                    <Award className="w-3 h-3" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">Trust Certified</span>
                                                </div>
                                            )}
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                                                {match.formattedHeight || `${match.height} cm`} • {match.gender}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8 pt-8 border-t border-slate-50 dark:border-slate-800/40">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date of Birth</p>
                                                {renderField(match.dob, <Calendar className="w-3.5 h-3.5 text-slate-300" />)}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                                                {renderField(match.familyCity, <MapPin className="w-3.5 h-3.5 text-slate-300" />)}
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Education</p>
                                                {renderField(match.education, <GraduationCap className="w-3.5 h-3.5 text-slate-300" />, "Hidden")}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Occupation</p>
                                                {renderField(match.occupation, <Briefcase className="w-3.5 h-3.5 text-slate-300" />, "Hidden")}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Hub */}
                                    <div className="mt-auto flex items-center gap-4 pt-6 border-t border-slate-50 dark:border-slate-800/40">
                                        <Link href={`/dashboard/matches/${match.id}`} className="flex-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 p-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] text-center hover:scale-[1.02] active:scale-100 transition-all shadow-xl dark:shadow-none">
                                            View Complete Profile
                                        </Link>
                                        
                                        {availableActions.filter(a => a.code === 'SHORTLIST').map(action => (
                                            <button 
                                                key={action.code}
                                                onClick={async () => {
                                                    try {
                                                        const adRes = await api.get('/business-directory/random-ad');
                                                        setShortlistModal({ isOpen: true, profileName: match.fullName, ad: adRes.data.data });
                                                    } catch (e) {
                                                        setShortlistModal({ isOpen: true, profileName: match.fullName });
                                                    }
                                                }}
                                                className="p-3.5 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500/20 transition-all"
                                                title="Shortlist Identification"
                                            >
                                                <Heart className="w-4 h-4 fill-current transition-transform group-hover:scale-125" />
                                            </button>
                                        ))}

                                        {isLocked(match.contactNumber) && (
                                            <Link href="/dashboard/profile" title="Unlock Details" className="p-3.5 bg-amber-500/10 text-amber-600 rounded-2xl hover:bg-amber-500/20 transition-all">
                                                <Lock className="w-4 h-4" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Matrix */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-16 p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/60 shadow-xl">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">
                                Page {page + 1} of {totalPages}
                            </span>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => { setPage(p => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    disabled={page === 0}
                                    className="px-8 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 transition-all"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => { setPage(p => Math.min(totalPages - 1, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    disabled={page >= totalPages - 1}
                                    className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl border border-slate-900 dark:border-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                                >
                                    Next Page
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            <Modal 
                isOpen={shortlistModal.isOpen}
                onClose={() => setShortlistModal({ isOpen: false, profileName: '' })}
                title="Profile Shortlisted"
                footer={
                    <button 
                        onClick={() => setShortlistModal({ isOpen: false, profileName: '' })}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                    >
                        Close
                    </button>
                }
            >
                <div className="space-y-10 py-4">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center animate-pulse">
                            <Heart className="w-8 h-8 fill-current" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-1">Shortlisted Successfully</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                <span className="text-indigo-600">{shortlistModal.profileName}</span> has been saved to your shortlisted profiles.
                            </p>
                        </div>
                    </div>

                    {shortlistModal.ad && (
                        <div className="pt-8 border-t border-slate-100 dark:border-slate-800/60">
                            <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 mb-6 tracking-[0.3em] pl-1">Sponsored Advertisement</p>
                            <div className="group bg-slate-50 dark:bg-slate-800/20 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800/60 hover:bg-white dark:hover:bg-slate-800/40 transition-all duration-500 flex flex-col gap-6 shadow-inner">
                                <div className="flex items-start justify-between gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[8px] font-black text-amber-600 uppercase tracking-[0.2em] mb-1">Sponsor</p>
                                            <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-amber-500 transition-colors">{shortlistModal.ad.name}</h4>
                                        </div>
                                        <div className="flex flex-wrap gap-4">
                                            <span className="text-[9px] font-black bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-800 uppercase tracking-widest text-slate-500">{shortlistModal.ad.category}</span>
                                            <span className="text-[9px] font-black bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-800 uppercase tracking-widest text-slate-500">{shortlistModal.ad.city}</span>
                                        </div>
                                    </div>
                                    {shortlistModal.ad.bannerUrl && (
                                        <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl border border-white dark:border-slate-800 rotate-3 group-hover:rotate-0 transition-all duration-500">
                                            <img src={`${IMAGE_BASE_URL}${shortlistModal.ad.bannerUrl}`} alt={shortlistModal.ad.name} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                                <div className="pt-6 border-t border-slate-200/40 flex items-center justify-between">
                                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">📞 {shortlistModal.ad.contactNumber}</span>
                                    <span className="text-[8px] font-bold text-slate-400 italic">Mention "Parichay" for Elite Access</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}

