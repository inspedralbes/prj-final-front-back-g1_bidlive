import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const UpcomingAuctions = () => {
    const { user } = useAuth();
    const [upcoming, setUpcoming] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        api.getAuctionsByUser(user.id)
            .then(data => {
                const list = Array.isArray(data) ? data : [];
                setUpcoming(list.filter(p => p.status === 'upcoming' || p.status === 'live'));
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [user]);

    return (
        <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-border-dark overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-border-dark flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">My Active & Upcoming</h3>
                <Link to="/create-auction" className="text-sm font-bold text-primary hover:underline">+ New</Link>
            </div>

            <div className="p-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                ) : upcoming.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                        <span className="material-symbols-outlined text-3xl mb-2">event_upcoming</span>
                        <p className="text-sm font-medium">No active or upcoming auctions.</p>
                        <Link to="/create-auction" className="mt-2 inline-block text-primary font-bold text-sm hover:underline">
                            Create one →
                        </Link>
                    </div>
                ) : (
                    upcoming.map((puja) => (
                        <Link
                            key={puja.id}
                            to={`/auction/${puja.status === 'live' ? 'video' : 'photo'}/${puja.id}`}
                            className="flex gap-4 p-4 border border-slate-200 dark:border-border-dark rounded-xl hover:border-primary/50 transition-colors group cursor-pointer"
                        >
                            <div
                                className="bg-center bg-cover h-16 w-16 rounded-lg bg-slate-200 dark:bg-white/10 flex-shrink-0"
                                style={puja.image_url ? { backgroundImage: `url('${puja.image_url}')` } : {}}
                            >
                                {!puja.image_url && (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="material-symbols-outlined text-slate-400">image</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                                        {puja.title}
                                    </h4>
                                    <span className={`ml-2 flex-shrink-0 px-2 py-1 text-xs font-bold rounded ${puja.status === 'live'
                                        ? 'bg-primary/10 text-primary'
                                        : 'bg-amber-100 text-amber-600'
                                        }`}>
                                        {puja.status === 'live' ? 'Live' : 'Upcoming'}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-[#ba9ca1] mt-1">
                                    ${puja.current_price || puja.starting_price}
                                </p>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default UpcomingAuctions;
