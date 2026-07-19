'use client';

import { useEffect, useState } from 'react';
import api, { IMAGE_BASE_URL } from '@/lib/api';
import { MapPin, Phone, User as UserIcon, Search, Megaphone } from 'lucide-react';

export default function BusinessDirectoryPage() {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const res = await api.get('/business-directory');
                if (res.data?.data) {
                    setListings(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch listings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, []);

    const categories = ['All', ...new Set(listings.map(l => l.category))];

    const filteredListings = listings.filter(l => {
        const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.city.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || l.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
            </div>
        );
    }

    const inputCls = 'w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-[13.5px] text-foreground placeholder:text-faint focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

    return (
        <div className="space-y-5 pb-12">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-[21px] font-semibold tracking-tight text-foreground">Business directory</h1>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">Discover and connect with community businesses.</p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                    <div className="relative flex-1 sm:w-72">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden />
                        <input
                            type="text"
                            placeholder="Search by name or city…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`${inputCls} pl-9`}
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className={`${inputCls} sm:w-44`}
                        aria-label="Filter by category"
                    >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </header>

            {filteredListings.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredListings.map((listing) => (
                        <div key={listing.id} className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-card transition-all hover:border-border-strong hover:shadow-lifted">
                            <div className="relative h-36 bg-surface-muted">
                                {listing.bannerUrl ? (
                                    <img src={`${IMAGE_BASE_URL}${listing.bannerUrl}`} alt={listing.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <Megaphone className="h-8 w-8 text-faint" aria-hidden />
                                    </div>
                                )}
                                <span className="absolute right-3 top-3 rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground shadow-card">
                                    {listing.category}
                                </span>
                            </div>
                            <div className="flex flex-1 flex-col p-4">
                                <h3 className="text-[15px] font-semibold tracking-tight text-foreground">{listing.name}</h3>
                                <div className="mt-2.5 space-y-1.5 text-[12.5px] text-muted-foreground">
                                    <p className="flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5 text-faint" aria-hidden /> {listing.city}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <UserIcon className="h-3.5 w-3.5 text-faint" aria-hidden /> {listing.contactPerson}
                                    </p>
                                </div>
                                <a
                                    href={`tel:${listing.contactNumber}`}
                                    className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-border-strong bg-surface px-3.5 py-2 text-[13px] font-semibold text-foreground transition-colors hover:bg-surface-hover tabular-nums"
                                >
                                    <Phone className="h-4 w-4 text-success" aria-hidden /> {listing.contactNumber}
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-xl border border-border bg-surface px-6 py-16 text-center shadow-card">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
                        <Megaphone className="h-6 w-6 text-faint" aria-hidden />
                    </span>
                    <h2 className="mt-4 text-[15px] font-semibold text-foreground">No businesses found</h2>
                    <p className="mt-1 text-[13px] text-muted-foreground">Try adjusting your search or category filter.</p>
                </div>
            )}

            {/* Listing CTA */}
            <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-border bg-surface-muted p-5 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-[15px] font-semibold text-foreground">List your business</h2>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">Reach thousands of community members through the directory.</p>
                </div>
                <button className="shrink-0 rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover">
                    Add business
                </button>
            </div>
        </div>
    );
}
