import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const ResultsGrid = () => {
    const [searchParams] = useSearchParams();
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAuctions = async () => {
            setLoading(true);
            try {
                const status = searchParams.get('status') || '';
                const q = searchParams.get('q') || '';
                const queryParams = new URLSearchParams();
                if (status) queryParams.append('status', status);
                if (q) queryParams.append('q', q);

                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/auction/pujas?${queryParams.toString()}`);
                if (!response.ok) throw new Error('Failed to fetch auctions');

                const data = await response.json();
                setAuctions(data);
            } catch (err) {
                console.error(err);
                setError('Failed to load auctions. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchAuctions();
    }, [searchParams]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20 text-red-500">
                <span className="material-symbols-outlined text-4xl mb-2">error</span>
                <p>{error}</p>
            </div>
        );
    }

    if (auctions.length === 0) {
        return (
            <div className="text-center py-20 text-slate-500">
                <span className="material-symbols-outlined text-4xl mb-2">search_off</span>
                <p>No auctions found matching your criteria.</p>
                <button
                    onClick={() => window.location.href = '/explore'}
                    className="mt-4 text-primary font-bold hover:underline"
                >
                    Clear filters
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold">{auctions.length} Results found</h3>
                <div className="flex gap-2">
                    <button className="p-2 rounded bg-primary/10 text-primary">
                        <span className="material-symbols-outlined">grid_view</span>
                    </button>
                    <button className="p-2 rounded text-slate-500">
                        <span className="material-symbols-outlined">view_list</span>
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {auctions.map(item => (
                    <Link to={`/auction/${item.status === 'live' ? 'video' : 'photo'}/${item.id}`} key={item.id} className="group bg-white dark:bg-surface-dark rounded-xl overflow-hidden border border-slate-200 dark:border-border-dark hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/5 cursor-pointer">
                        <div className="relative aspect-[4/3] overflow-hidden">
                            <div
                                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                                style={{ backgroundImage: `url('${item.img}')` }}
                            ></div>

                            {/* Badges */}
                            {item.status === 'live' && (
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 uppercase tracking-wider">
                                        <span className="size-1.5 bg-white rounded-full live-pulse"></span> Live Now
                                    </span>
                                </div>
                            )}

                            {item.status === 'upcoming' && (
                                <div className="absolute top-3 left-3">
                                    <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 uppercase tracking-wider">
                                        <span className="material-symbols-outlined text-[14px]">schedule</span> Starting Soon
                                    </span>
                                </div>
                            )}

                            {item.status === 'live' && (
                                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                                    <div className="bg-black/60 backdrop-blur-md text-white rounded-lg p-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm text-primary">visibility</span>
                                        <span className="text-xs font-bold">{item.viewers || 0} watching</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-lg line-clamp-1">{item.title}</h4>
                                <span className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors">favorite</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">{item.description}</p>

                            <div className="bg-slate-50 dark:bg-surface-dark rounded-xl p-3 flex flex-col gap-2 border border-slate-100 dark:border-border-dark">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Current Bid</span>
                                    <span className="text-xs font-bold text-primary">
                                        0 Bids
                                    </span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-2xl font-black text-primary">{item.bid}</span>
                                    {item.status === 'upcoming' ? (
                                        <button className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg">Remind Me</button>
                                    ) : (
                                        <span className="text-xs font-bold text-slate-400">Bid Now</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ResultsGrid;
