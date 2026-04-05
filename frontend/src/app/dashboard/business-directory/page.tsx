'use client';

import { useEffect, useState } from 'react';
import api, { IMAGE_BASE_URL } from '@/lib/api';
import { MapPin, Phone, Briefcase, Search, Filter, Megaphone } from 'lucide-react';

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
        return <div className="p-8 flex justify-center items-center h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>;
    }

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Aggarwal Business Directory</h1>
                <p className="text-gray-500 dark:text-gray-400">Exclusive platform for Aggarwal-owned businesses to connect with the community.</p>
            </div>

            {/* Search & Filter Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search by business name or city..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                    >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>

            {/* Listings Grid */}
            {filteredListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredListings.map((listing) => (
                        <div key={listing.id} className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="h-40 bg-gray-100 dark:bg-slate-800 relative">
                                {listing.bannerUrl ? (
                                    <img src={`${IMAGE_BASE_URL}${listing.bannerUrl}`} alt={listing.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/10 text-indigo-300 dark:text-indigo-400">
                                        <Megaphone className="w-12 h-12 opacity-50" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest shadow-sm">
                                    {listing.category}
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 truncate">{listing.name}</h3>
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span>{listing.city}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                        <Briefcase className="w-4 h-4 text-gray-400" />
                                        <span>Contact: {listing.contactPerson}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                        <Phone className="w-4 h-4" />
                                        <span>{listing.contactNumber}</span>
                                    </div>
                                </div>
                                <button className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-2xl text-sm font-bold transition-all">
                                    Call Business
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-gray-200 dark:border-slate-800">
                    <Megaphone className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">No listings found</h2>
                    <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters.</p>
                </div>
            )}
            
            {/* Ad Call to Action */}
            <div className="mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-12 -translate-y-12"></div>
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-20 translate-y-20"></div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 relative z-10">Own an Aggarwal Business?</h2>
                <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto relative z-10">Promote your brand to thousands of community members and grow your revenue.</p>
                <button className="px-8 py-3 bg-white text-indigo-600 rounded-2xl font-bold shadow-lg transition-all hover:scale-105 relative z-10">
                    Register Your Business
                </button>
            </div>
        </div>
    );
}
