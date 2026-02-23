import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const UpcomingRail = () => {
    const [drops, setDrops] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getAuctions('upcoming')
            .then(data => {
                setDrops(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch upcoming drops:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return null;
    if (drops.length === 0) return null; // No upcoming auctions

    return (
        <section className="pb-20">
            <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    <span className="material-symbols-outlined text-primary">calendar_month</span> Upcoming Drops
                </h2>
                <div className="flex gap-2">
                    <button className="p-1 border border-slate-200 dark:border-border-dark rounded bg-white dark:bg-surface-dark hover:bg-slate-100 dark:hover:bg-border-dark text-slate-600 dark:text-slate-300 transition-colors">
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button className="p-1 border border-slate-200 dark:border-border-dark rounded bg-white dark:bg-surface-dark hover:bg-slate-100 dark:hover:bg-border-dark text-slate-600 dark:text-slate-300 transition-colors">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar no-scrollbar">
                {drops.map((item) => (
                    <Link to={`/auction/photo/${item.id}`} key={item.id} className="min-w-[320px] bg-white dark:bg-surface-dark rounded-xl overflow-hidden border border-slate-200 dark:border-border-dark group hover:border-primary/50 transition-colors shadow-sm cursor-pointer block">
                        <div className="relative h-40 bg-slate-100 dark:bg-black/20">
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                style={item.image_url ? { backgroundImage: `url('${item.image_url}')` } : {}}
                            >
                                {!item.image_url && (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700">image</span>
                                    </div>
                                )}
                            </div>
                            <div className="absolute top-2 right-2">
                                <button className="bg-white/20 dark:bg-black/60 backdrop-blur-md p-1.5 rounded-full text-slate-900 dark:text-white hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-sm">notifications_active</span>
                                </button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                                <p className="text-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-between w-full">
                                    <span>Status</span>
                                    <span className="text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded">Upcoming</span>
                                </p>
                            </div>
                        </div>
                        <div className="p-4">
                            <h4 className="font-bold mb-1 text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{item.description || 'No description available for this upcoming auction.'}</p>
                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Starting Price</p>
                                <span className="text-sm font-black text-slate-900 dark:text-white">€{item.starting_price}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default UpcomingRail;
