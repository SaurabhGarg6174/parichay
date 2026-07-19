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
        <div className="max-w-7xl mx-auto pb-32 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Intel Header */}
            <div className="mb-16 relative">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em]">Business Network</h4>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Business Directory</h1>
                        <p className="text-lg text-slate-500 font-medium max-w-xl">Discover and connect with community businesses and enterprises.</p>
                    </div>
                </div>
            </div>

            {/* Vaulted Tactical Controls */}
            <div className="mb-12 p-2 bg-slate-900 border border-slate-800/60 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row gap-2 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-[100%] transition-all duration-500 group-hover:bg-indigo-500/10" />
                <div className="flex-1 relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Search for businesses..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-16 pr-8 py-6 bg-transparent text-white font-bold text-lg placeholder:text-slate-700 outline-none transition-all"
                    />
                </div>
                <div className="w-px bg-slate-800 hidden md:block" />
                <div className="md:w-64 relative">
                    <Filter className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full pl-16 pr-10 py-6 bg-transparent text-white font-black text-xs uppercase tracking-[0.2em] outline-none appearance-none cursor-pointer"
                    >
                        {categories.map(cat => <option key={cat} value={cat} className="bg-slate-900 text-white">{cat}</option>)}
                    </select>
                </div>
            </div>

            {/* Entity Matrix */}
            {filteredListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredListings.map((listing) => (
                        <div key={listing.id} className="group bg-slate-900 rounded-[2.5rem] border border-slate-800/60 overflow-hidden shadow-xl transition-all duration-700 hover:-translate-y-2 hover:border-indigo-500/40 relative">
                            <div className="h-44 bg-slate-950 relative overflow-hidden">
                                {listing.bannerUrl ? (
                                    <img src={`${IMAGE_BASE_URL}${listing.bannerUrl}`} alt={listing.name} className="w-full h-full object-cover grayscale opacity-40 transition-all duration-1000 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-indigo-500/5 text-slate-800">
                                        <Megaphone className="w-16 h-16 opacity-20" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 px-4 py-1.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] shadow-2xl">
                                    {listing.category}
                                </div>
                            </div>
                            <div className="p-10 relative">
                                <h3 className="text-2xl font-black text-white mb-6 group-hover:text-indigo-400 transition-colors">{listing.name}</h3>
                                <div className="space-y-4 mb-10">
                                    <div className="flex items-center gap-4 text-slate-400">
                                        <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-bold tracking-tight">{listing.city}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-slate-400">
                                        <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                                            <Briefcase className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-bold tracking-tight">Contact: {listing.contactPerson}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-emerald-400 pt-2">
                                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <span className="text-lg font-black tracking-tighter">{listing.contactNumber}</span>
                                    </div>
                                </div>
                                <button className="w-full py-4.5 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:bg-indigo-500 hover:text-white active:scale-95 shadow-xl shadow-black/40">
                                    Contact Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-32 bg-slate-900 rounded-[3rem] border border-dashed border-slate-800">
                    <Megaphone className="w-20 h-20 text-slate-800 mx-auto mb-6" />
                    <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-widest">No Businesses Found</h2>
                    <p className="text-slate-500 font-medium tracking-tight">Please try adjusting your search or filters.</p>
                </div>
            )}
            
            {/* Elite Integration Module (CTA) */}
            <div className="mt-24 relative rounded-[4rem] p-16 md:p-24 text-center overflow-hidden bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
                {/* Visual Depth */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[120px] -mr-80 -mt-80" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[100px] -ml-40 -mb-40" />
                
                <div className="relative z-10 max-w-3xl mx-auto space-y-10">
                    <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.6em]">Grow With Us</h4>
                    <h2 className="text-4xl md:text-7xl font-black text-slate-950 dark:text-white tracking-tighter leading-[0.9]">List Your Business.</h2>
                    <p className="text-xl text-slate-500 font-medium leading-relaxed">Add your business to our directory and reach thousands of community members.</p>
                    <button className="px-16 py-6 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-100 shadow-2xl shadow-indigo-500/20">
                        Add Business
                    </button>
                </div>
            </div>
        </div>
    );

}
