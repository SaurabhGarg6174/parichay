'use client';

import { useEffect, useState, useCallback } from 'react';
import api, { IMAGE_BASE_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
    Search, User as UserIcon, Lock,
    X, SlidersHorizontal, Heart, ShieldCheck, Award
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

const FILTER_LABELS: Record<keyof SearchFilters, string> = {
    name: 'Name', gotra: 'Gotra', gender: 'Gender', minAge: 'Min age',
    maxAge: 'Max age', education: 'Education', city: 'City', isManglik: 'Manglik'
};

const inputCls = 'w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-[13.5px] text-foreground placeholder:text-faint focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';
const labelCls = 'block text-[12.5px] font-semibold text-foreground mb-1.5';

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

    const removeFilter = (key: keyof SearchFilters) => {
        const next = { ...appliedFilters, [key]: '' };
        setFilters(next);
        setAppliedFilters(next);
        setPage(0);
    };

    const activeFilterEntries = (Object.entries(appliedFilters) as [keyof SearchFilters, string][]).filter(([, v]) => v !== '');
    const activeFilterCount = activeFilterEntries.length;

    const formatShortName = (name: string) => {
        if (!name) return "";
        const parts = name.trim().split(/\s+/);
        if (parts.length <= 2) return name;
        return `${parts[0]} ${parts[parts.length - 1]}`;
    };

    const isLocked = (val: string | undefined | null) => val === "Unlock to view";

    const renderField = (value: string | undefined | null, fallback: string = "Not specified") => {
        if (!value) return <span className="text-[12.5px] text-faint">{fallback}</span>;
        if (isLocked(value)) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-warning-subtle px-2 py-0.5 text-[11px] font-semibold text-warning">
                    <Lock className="h-3 w-3" aria-hidden /> Members only
                </span>
            );
        }
        return <span className="text-[12.5px] font-medium text-foreground">{value}</span>;
    };

    return (
        <div className="space-y-5">
            <SuccessStories />

            {/* Page head */}
            <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-[21px] font-semibold tracking-tight text-foreground">Matches</h1>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">
                        {loading ? 'Loading profiles…' : `${totalElements} ${totalElements === 1 ? 'profile matches' : 'profiles match'} your preferences`}
                    </p>
                </div>

                <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                    <div className="relative flex-1 sm:w-72">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden />
                        <input
                            type="text"
                            placeholder="Search by name…"
                            value={filters.name}
                            onChange={e => setFilters(prev => ({ ...prev, name: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && handleApplyFilters()}
                            className={`${inputCls} pl-9`}
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center justify-center gap-2 rounded-lg border px-3.5 py-2 text-[13px] font-semibold transition-colors ${showFilters || activeFilterCount > 0
                            ? 'border-primary bg-primary-subtle text-primary'
                            : 'border-border-strong bg-surface text-foreground hover:bg-surface-hover'
                            }`}
                    >
                        <SlidersHorizontal className="h-4 w-4" aria-hidden />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10.5px] font-semibold leading-none text-white">{activeFilterCount}</span>
                        )}
                    </button>
                </div>
            </header>

            {/* Applied filter chips */}
            {activeFilterCount > 0 && !showFilters && (
                <div className="flex flex-wrap items-center gap-2">
                    {activeFilterEntries.map(([key, value]) => (
                        <button
                            key={key}
                            onClick={() => removeFilter(key)}
                            className="flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
                        >
                            {FILTER_LABELS[key]}: {value}
                            <X className="h-3 w-3" aria-hidden />
                        </button>
                    ))}
                    <button onClick={handleClearFilters} className="text-[12px] font-semibold text-primary hover:underline">
                        Clear all
                    </button>
                </div>
            )}

            {/* Filter panel */}
            {showFilters && (
                <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground">Filter matches</h3>
                        <button
                            onClick={() => setShowFilters(false)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                            aria-label="Close filters"
                        >
                            <X className="h-4 w-4" aria-hidden />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            { label: 'Gotra', name: 'gotra', options: lookups['GOTRA'] },
                            { label: 'Gender', name: 'gender', options: lookups['GENDER'] },
                            { label: 'Education', name: 'education', options: lookups['EDUCATION'] },
                            { label: 'Manglik', name: 'isManglik', options: lookups['MANGLIK_STATUS'] }
                        ].map((field) => (
                            <div key={field.name}>
                                <label className={labelCls}>{field.label}</label>
                                <select
                                    name={field.name}
                                    value={filters[field.name as keyof SearchFilters]}
                                    onChange={handleChange}
                                    className={inputCls}
                                >
                                    <option value="">Any</option>
                                    {(field.options || []).map(l => <option key={l.id} value={l.label}>{l.label}</option>)}
                                </select>
                            </div>
                        ))}

                        <div>
                            <label className={labelCls}>City</label>
                            <input
                                name="city"
                                value={filters.city}
                                onChange={handleChange}
                                placeholder="Any city"
                                className={inputCls}
                            />
                        </div>

                        <div>
                            <label className={labelCls}>Min age</label>
                            <input
                                type="number"
                                name="minAge"
                                value={filters.minAge}
                                onChange={handleChange}
                                placeholder="18"
                                className={inputCls}
                            />
                        </div>

                        <div>
                            <label className={labelCls}>Max age</label>
                            <input
                                type="number"
                                name="maxAge"
                                value={filters.maxAge}
                                onChange={handleChange}
                                placeholder="70"
                                className={inputCls}
                            />
                        </div>
                    </div>

                    <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
                        <button
                            onClick={handleClearFilters}
                            className="rounded-lg px-3.5 py-2 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                        >
                            Clear filters
                        </button>
                        <button
                            onClick={handleApplyFilters}
                            className="rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover"
                        >
                            Apply filters
                        </button>
                    </div>
                </div>
            )}

            {/* Results */}
            {loading ? (
                <div className="flex min-h-[300px] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
                </div>
            ) : matches.length === 0 ? (
                <div className="rounded-xl border border-border bg-surface px-6 py-16 text-center shadow-card">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
                        <UserIcon className="h-6 w-6 text-faint" aria-hidden />
                    </span>
                    <h2 className="mt-4 text-[15px] font-semibold text-foreground">No matches found</h2>
                    <p className="mx-auto mt-1 max-w-sm text-[13px] text-muted-foreground">
                        Try widening your filters — a broader age range or more cities usually helps.
                    </p>
                    <button
                        onClick={handleClearFilters}
                        className="mt-5 rounded-lg border border-border-strong bg-surface px-4 py-2 text-[13px] font-semibold text-foreground transition-colors hover:bg-surface-hover"
                    >
                        Clear all filters
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {matches.map((match) => (
                            <div key={match.id} className="flex flex-col rounded-xl border border-border bg-surface shadow-card transition-all hover:border-border-strong hover:shadow-lifted">
                                {/* Header */}
                                <div className="flex gap-3 p-4 pb-0">
                                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[10px] border border-border bg-surface-muted">
                                        {match.photoUrl ? (
                                            <img
                                                src={`${IMAGE_BASE_URL}${match.photoUrl}`}
                                                alt={match.fullName}
                                                className={`h-full w-full object-cover ${!match.isPhotoAccessible ? 'scale-125 opacity-40 blur-md' : ''}`}
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <UserIcon className="h-6 w-6 text-faint" aria-hidden />
                                            </div>
                                        )}
                                        {!match.isPhotoAccessible && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Lock className="h-4 w-4 text-muted-foreground" aria-hidden />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="truncate text-[15px] font-semibold tracking-tight text-foreground">{formatShortName(match.fullName)}</h3>
                                            {match.verified && (
                                                <span className="flex shrink-0 items-center gap-1 rounded-full bg-success-subtle px-2 py-0.5 text-[10.5px] font-semibold text-success">
                                                    <ShieldCheck className="h-3 w-3" aria-hidden /> Verified
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                                            {[match.formattedHeight || (match.height ? `${match.height} cm` : null), match.gender, match.familyCity].filter(Boolean).join(' · ')}
                                        </p>
                                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                                            {match.maritalStatus && (
                                                <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10.5px] font-semibold text-muted-foreground">{match.maritalStatus}</span>
                                            )}
                                            {match.isCommunityVerified && (
                                                <span className="flex items-center gap-1 rounded-full bg-premium-subtle px-2 py-0.5 text-[10.5px] font-semibold text-premium">
                                                    <Award className="h-3 w-3" aria-hidden /> Community verified
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Facts */}
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 p-4">
                                    <div>
                                        <p className="text-[11px] text-faint">Date of birth</p>
                                        {renderField(match.dob)}
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-faint">Gotra</p>
                                        {renderField(match.gotra)}
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-faint">Education</p>
                                        {renderField(match.education, 'Hidden')}
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-faint">Occupation</p>
                                        {renderField(match.occupation, 'Hidden')}
                                    </div>
                                </div>

                                {!match.isPhotoAccessible && match.photoUrl && (
                                    <p className="mx-4 rounded-lg bg-surface-muted px-3 py-2 text-[11.5px] text-muted-foreground">
                                        Photo visible after they approve your request
                                    </p>
                                )}

                                {/* Actions */}
                                <div className="mt-auto flex items-center gap-2 p-4">
                                    <Link
                                        href={`/dashboard/matches/${match.id}`}
                                        className="flex-1 rounded-lg border border-border-strong bg-surface px-3.5 py-2 text-center text-[13px] font-semibold text-foreground transition-colors hover:bg-surface-hover"
                                    >
                                        View profile
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
                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-strong text-primary transition-colors hover:bg-primary-subtle"
                                            title="Add to shortlist"
                                            aria-label={`Shortlist ${formatShortName(match.fullName)}`}
                                        >
                                            <Heart className="h-4 w-4" aria-hidden />
                                        </button>
                                    ))}

                                    {isLocked(match.contactNumber) && (
                                        <Link
                                            href="/dashboard/payment/memberships"
                                            title="Unlock contact details with a membership"
                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-strong text-warning transition-colors hover:bg-warning-subtle"
                                        >
                                            <Lock className="h-4 w-4" aria-hidden />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 shadow-card">
                            <span className="text-[12.5px] text-muted-foreground tabular-nums">
                                Page {page + 1} of {totalPages}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setPage(p => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    disabled={page === 0}
                                    className="rounded-lg border border-border-strong bg-surface px-3.5 py-1.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => { setPage(p => Math.min(totalPages - 1, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    disabled={page >= totalPages - 1}
                                    className="rounded-lg bg-primary px-3.5 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            <Modal
                isOpen={shortlistModal.isOpen}
                onClose={() => setShortlistModal({ isOpen: false, profileName: '' })}
                title="Added to shortlist"
                footer={
                    <button
                        onClick={() => setShortlistModal({ isOpen: false, profileName: '' })}
                        className="rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover"
                    >
                        Close
                    </button>
                }
            >
                <div className="space-y-5 py-2">
                    <div className="flex items-center gap-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-subtle">
                            <Heart className="h-5 w-5 text-primary" aria-hidden />
                        </span>
                        <p className="text-[13.5px] text-muted-foreground">
                            <span className="font-semibold text-foreground">{shortlistModal.profileName}</span> has been saved to your shortlist.
                        </p>
                    </div>

                    {shortlistModal.ad && (
                        <div className="border-t border-border pt-4">
                            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-faint">Sponsored</p>
                            <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-surface-muted p-4">
                                <div className="min-w-0">
                                    <h4 className="text-[14px] font-semibold text-foreground">{shortlistModal.ad.name}</h4>
                                    <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                                        {[shortlistModal.ad.category, shortlistModal.ad.city].filter(Boolean).join(' · ')}
                                    </p>
                                    <p className="mt-2 text-[12.5px] font-medium text-foreground">📞 {shortlistModal.ad.contactNumber}</p>
                                    <p className="mt-1 text-[11.5px] text-faint">Mention "Parichay" when you call</p>
                                </div>
                                {shortlistModal.ad.bannerUrl && (
                                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border">
                                        <img src={`${IMAGE_BASE_URL}${shortlistModal.ad.bannerUrl}`} alt={shortlistModal.ad.name} className="h-full w-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
