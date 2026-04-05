'use client';

import { useEffect, useState } from 'react';
import api, { IMAGE_BASE_URL } from '@/lib/api';
import { Heart, Quote, Calendar } from 'lucide-react';

interface SuccessStory {
    id: number;
    groomName: string;
    brideName: string;
    story: string;
    photoUrl: string;
    weddingDate: string;
}

export default function SuccessStories() {
    const [stories, setStories] = useState<SuccessStory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const res = await api.get('/profiles/success-stories');
                if (res.data?.data) {
                    setStories(res.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch success stories');
            } finally {
                setLoading(false);
            }
        };
        fetchStories();
    }, []);

    if (loading || stories.length === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 mb-8">
            <div className="flex items-center gap-3 mb-10">
                <div className="p-3 bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl">
                    <Heart className="w-6 h-6 fill-current" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Community Success Stories</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Celebrating the unions formed through Parichay</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {stories.map((story) => (
                    <div key={story.id} className="group relative bg-gray-50/50 dark:bg-slate-800/30 rounded-[2rem] p-6 border border-gray-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all duration-500 hover:shadow-2xl hover:shadow-rose-500/10 hover:-translate-y-1">
                        <div className="relative h-48 mb-6 rounded-2xl overflow-hidden shadow-lg transform group-hover:scale-[1.02] transition-transform duration-500">
                            {story.photoUrl ? (
                                <img 
                                    src={`${IMAGE_BASE_URL}${story.photoUrl}`} 
                                    alt={`${story.groomName} & ${story.brideName}`} 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-rose-100 to-indigo-100 dark:from-rose-900/20 dark:to-indigo-900/20 flex items-center justify-center">
                                    <Heart className="w-12 h-12 text-rose-300 dark:text-rose-700" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-bottom p-4">
                                <p className="mt-auto text-white font-bold text-lg">{story.groomName} & {story.brideName}</p>
                            </div>
                        </div>

                        <div className="relative">
                            <Quote className="absolute -top-2 -left-2 w-8 h-8 text-rose-200 dark:text-rose-900/30 -z-10" />
                            <p className="text-sm text-gray-600 dark:text-gray-300 italic mb-4 line-clamp-3 leading-relaxed">
                                "{story.story}"
                            </p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700/50">
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(story.weddingDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                            </div>
                            <span className="text-[10px] font-bold bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-full border border-rose-100 dark:border-rose-800/50">
                                Match Verified
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
