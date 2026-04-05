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
        <div className="max-w-7xl mx-auto">
            <SuccessStories />
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Discover Matches</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {loading ? 'Searching...' : `Found ${totalElements} active profiles`}
                    </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={filters.name}
                            onChange={e => setFilters(prev => ({ ...prev, name: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && handleApplyFilters()}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm transition-all shadow-sm ${showFilters || activeFilterCount > 0
                            ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400'
                            : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                            }`}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{activeFilterCount}</span>
                        )}
                    </button>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 mb-6 animate-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Filter className="w-5 h-5 text-indigo-500" /> Search Filters
                        </h3>
                        <button onClick={() => setShowFilters(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Gotra</label>
                            <select
                                name="gotra"
                                value={filters.gotra}
                                onChange={handleChange}
                                className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Gotras</option>
                                {(lookups['GOTRA'] || []).map(l => <option key={l.id} value={l.label}>{l.label}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Gender</label>
                            <select
                                name="gender"
                                value={filters.gender}
                                onChange={handleChange}
                                className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Genders</option>
                                {(lookups['GENDER'] || []).map(l => <option key={l.id} value={l.label}>{l.label}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Education</label>
                            <select
                                name="education"
                                value={filters.education}
                                onChange={handleChange}
                                className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Education</option>
                                {(lookups['EDUCATION'] || []).map(l => <option key={l.id} value={l.label}>{l.label}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Manglik Status</label>
                            <select
                                name="isManglik"
                                value={filters.isManglik}
                                onChange={handleChange}
                                className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Any Status</option>
                                {(lookups['MANGLIK_STATUS'] || []).map(l => <option key={l.id} value={l.label}>{l.label}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">City</label>
                            <input
                                name="city"
                                value={filters.city}
                                onChange={handleChange}
                                placeholder="Search city..."
                                className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Min Age</label>
                            <input
                                type="number"
                                name="minAge"
                                min="18"
                                max="70"
                                placeholder="18"
                                value={filters.minAge}
                                onChange={handleChange}
                                className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Max Age</label>
                            <input
                                type="number"
                                name="maxAge"
                                min="18"
                                max="70"
                                placeholder="40"
                                value={filters.maxAge}
                                onChange={handleChange}
                                className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-slate-800">
                        <button
                            onClick={handleClearFilters}
                            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                        >
                            Clear All
                        </button>
                        <button
                            onClick={handleApplyFilters}
                            className="px-6 py-2.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Active Filters Tags */}
            {activeFilterCount > 0 && !showFilters && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {Object.entries(appliedFilters)
                        .filter(([, v]) => v !== '')
                        .map(([key, value]) => (
                            <span key={key} className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-3 py-1.5 rounded-lg text-sm font-medium border border-indigo-100 dark:border-indigo-500/20">
                                <span className="text-indigo-400 dark:text-indigo-500 capitalize">{key === 'isManglik' ? 'Manglik' : key === 'minAge' ? 'Min Age' : key === 'maxAge' ? 'Max Age' : key}:</span>
                                {value}
                                <button onClick={() => {
                                    const updated = { ...appliedFilters, [key]: '' };
                                    setAppliedFilters(updated);
                                    setFilters(updated);
                                    setPage(0);
                                }}>
                                    <X className="w-3.5 h-3.5 text-indigo-400 dark:text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300" />
                                </button>
                            </span>
                        ))}
                    <button onClick={handleClearFilters} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline">
                        Clear all
                    </button>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="p-8 flex justify-center items-center h-[50vh]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            )}

            {/* Results */}
            {!loading && matches.length === 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-12 text-center">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Matches Found</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        {activeFilterCount > 0
                            ? 'Try adjusting your filters to see more results.'
                            : "We couldn't find any active profiles at the moment. Please check back later."}
                    </p>
                    {activeFilterCount > 0 && (
                        <button onClick={handleClearFilters} className="px-6 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors">
                            Clear Filters
                        </button>
                    )}
                </div>
            )}

            {!loading && matches.length > 0 && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {matches.map((match) => (
                            <div key={match.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                                {/* Card Header */}
                                <div className="h-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 relative">
                                    <div className="absolute -bottom-10 left-6">
                                        <div className={`w-24 h-24 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-4 border-white dark:border-slate-800 flex items-center justify-center -mb-8 overflow-hidden relative ${!match.isPhotoAccessible ? 'backdrop-blur-xl' : ''}`}>
                                            {match.photoUrl ? (
                                                <img 
                                                    src={`${IMAGE_BASE_URL}${match.photoUrl}`} 
                                                    alt={match.fullName} 
                                                    className={`w-full h-full object-cover transition-all duration-700 ${!match.isPhotoAccessible ? 'blur-2xl opacity-50 scale-125' : 'group-hover:scale-110'}`} 
                                                />
                                            ) : (
                                                <UserIcon className="w-12 h-12 text-gray-300 dark:text-gray-500" />
                                            )}
                                            {!match.isPhotoAccessible && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                                    <Lock className="w-6 h-6 text-white drop-shadow-md" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-md uppercase tracking-wider">
                                        {match.maritalStatus || 'Single'}
                                    </div>
                                    {match.gotra && (
                                        <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-md">
                                            {match.gotra}
                                        </div>
                                    )}
                                </div>

                                {/* Card Body */}
                                <div className="pt-12 pb-6 px-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{match.fullName}</h3>
                                        {match.verified && (
                                            <div title="Verified Profile">
                                                <ShieldCheck className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-500/10" />
                                            </div>
                                        )}
                                        {match.isCommunityVerified && (
                                            <div title="Community Verified (Vikas Trust)" className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-700/30">
                                                <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                                                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-tighter">Verified</span>
                                            </div>
                                        )}
                                    </div>
                                    {match.sameGotra && (
                                        <div className="mb-2 flex items-center gap-1.5 p-2 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-lg">
                                            <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
                                            <p className="text-[10px] font-semibold text-rose-700 dark:text-rose-400 leading-tight">Same Gotra ({match.gotra}) - Please verify Sagal rules</p>
                                        </div>
                                    )}
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
                                        
                                        {availableActions.filter(a => a.code !== 'VIEW').map(action => (
                                            <button 
                                                key={action.code}
                                                onClick={async () => {
                                                    if (action.code === 'SHORTLIST') {
                                                        try {
                                                            const adRes = await api.get('/business-directory/random-ad');
                                                            setShortlistModal({ 
                                                                isOpen: true, 
                                                                profileName: match.fullName,
                                                                ad: adRes.data.data 
                                                            });
                                                        } catch (e) {
                                                            setShortlistModal({ isOpen: true, profileName: match.fullName });
                                                        }
                                                    }
                                                }}
                                                className={`p-2.5 rounded-lg border transition-all ${action.code === 'SHORTLIST' ? 'border-rose-100 bg-rose-50 text-rose-500 hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10' : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                                title={action.label}
                                            >
                                                {action.code === 'SHORTLIST' && <Heart className="w-5 h-5" />}
                                                {action.code !== 'SHORTLIST' && <span>{action.label}</span>}
                                            </button>
                                        ))}

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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Page {page + 1} of {totalPages} ({totalElements} profiles)
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="flex items-center gap-1 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Previous
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page >= totalPages - 1}
                                    className="flex items-center gap-1 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next <ChevronRight className="w-4 h-4" />
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
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-105"
                    >
                        Great!
                    </button>
                }
            >
                <div className="flex flex-col gap-6 text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
                            <Heart className="w-8 h-8 fill-current" />
                        </div>
                        <p className="text-lg">
                            <span className="font-bold text-gray-900 dark:text-gray-100">{shortlistModal.profileName}</span> is now in your shortlist.
                        </p>
                    </div>

                    {shortlistModal.ad && (
                        <div className="mt-4 border-t border-gray-100 dark:border-slate-800 pt-6">
                            <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 mb-2 tracking-widest pl-1">Community Business Partner</p>
                            <div className="group relative overflow-hidden rounded-2xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-900/10 p-4 transition-all hover:bg-amber-50 dark:hover:bg-amber-900/20">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h4 className="text-base font-bold text-amber-900 dark:text-amber-400 leading-tight mb-1">{shortlistModal.ad.name}</h4>
                                        <p className="text-xs font-semibold text-amber-700/70 dark:text-amber-500 uppercase tracking-tighter mb-2">{shortlistModal.ad.category}</p>
                                        <div className="flex items-center gap-2 text-xs text-amber-800/60 dark:text-amber-400/60">
                                            <MapPin className="w-3 h-3" />
                                            <span>{shortlistModal.ad.city}</span>
                                        </div>
                                    </div>
                                    {shortlistModal.ad.bannerUrl && (
                                        <div className="w-20 h-20 rounded-xl overflow-hidden shadow-sm border border-amber-200/20 group-hover:scale-105 transition-transform">
                                            <img src={`${IMAGE_BASE_URL}${shortlistModal.ad.bannerUrl}`} alt={shortlistModal.ad.name} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 flex items-center justify-between border-t border-amber-200/20 pt-3">
                                    <span className="text-xs font-bold text-amber-600 dark:text-amber-500">📞 {shortlistModal.ad.contactNumber}</span>
                                    <span className="text-[10px] font-medium text-amber-400 dark:text-amber-600 italic">Mention "Parichay" for disc.</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}

