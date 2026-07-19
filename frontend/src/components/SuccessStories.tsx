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
        <div className="rounded-xl border border-border bg-surface shadow-card">
            <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5">
                <Heart className="h-4 w-4 text-primary" aria-hidden />
                <div>
                    <h2 className="text-sm font-semibold text-foreground">Success stories</h2>
                </div>
                <p className="ml-auto text-[12px] text-faint">Unions formed through Parichay</p>
            </div>

            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
                {stories.map((story) => (
                    <div key={story.id} className="overflow-hidden rounded-[10px] border border-border bg-surface transition-all hover:border-border-strong hover:shadow-lifted">
                        <div className="relative h-40">
                            {story.photoUrl ? (
                                <img
                                    src={`${IMAGE_BASE_URL}${story.photoUrl}`}
                                    alt={`${story.groomName} & ${story.brideName}`}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-surface-muted">
                                    <Heart className="h-8 w-8 text-faint" aria-hidden />
                                </div>
                            )}
                            <div className="absolute inset-0 flex bg-gradient-to-t from-black/60 to-transparent p-3">
                                <p className="mt-auto text-[14px] font-semibold text-white">{story.groomName} &amp; {story.brideName}</p>
                            </div>
                        </div>

                        <div className="p-4">
                            <p className="line-clamp-3 text-[12.5px] leading-relaxed text-muted-foreground">
                                <Quote className="mr-1 inline h-3 w-3 text-faint" aria-hidden />
                                {story.story}
                            </p>
                            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                                <span className="flex items-center gap-1.5 text-[11.5px] text-faint">
                                    <Calendar className="h-3 w-3" aria-hidden />
                                    {new Date(story.weddingDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                                </span>
                                <span className="rounded-full bg-success-subtle px-2 py-0.5 text-[10.5px] font-semibold text-success">
                                    Verified match
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
