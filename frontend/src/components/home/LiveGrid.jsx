import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const LiveGrid = () => {
    const [liveItems, setLiveItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getAuctions('live')
            .then(data => {
                setLiveItems(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch live auctions:", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <section className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </section>
        );
    }

    if (liveItems.length === 0) return null;

    return (
        <section>
            <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">live_tv</span> Live Streams
                </h2>
                <div className="flex items-center gap-4">
                    <button className="text-xs font-bold bg-white dark:bg-surface-dark px-3 py-1.5 rounded-lg border border-slate-200 dark:border-border-dark shadow-sm">Filter: Most Viewers</button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {liveItems.map(item => (
                    <Link to={`/auction/video/${item.id}`} key={item.id} className="flex flex-col gap-3 group">
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-surface-dark shadow-lg border border-slate-200 dark:border-transparent">
                            <div
                                className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                                style={item.image_url ? { backgroundImage: `url('${item.image_url}')` } : {}}
                            >
                                {!item.image_url && (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-surface-dark">
                                        <span className="material-symbols-outlined text-4xl text-slate-400">image</span>
                                    </div>
                                )}
                            </div>
                            <div className="absolute top-2 left-2 flex gap-1">
                                <span className="bg-primary text-[10px] font-bold px-1.5 py-0.5 rounded text-white live-pulse">LIVE</span>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button className="bg-primary text-white p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                    <span className="material-symbols-outlined text-3xl">play_arrow</span>
                                </button>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-bold text-sm shrink-0 uppercase shadow-md">
                                    {(item.seller || `U${item.seller_id}`).charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold line-clamp-1 group-hover:text-primary transition-colors text-slate-900 dark:text-white">{item.title}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.seller || `User ${item.seller_id}`}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="bg-slate-100 dark:bg-surface-dark px-2 py-0.5 rounded text-[10px] font-semibold text-slate-600 dark:text-slate-300">Auction</span>
                                        <span className="text-primary text-[10px] font-black tracking-wider uppercase">Bid: €{item.current_price || item.starting_price}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default LiveGrid;
