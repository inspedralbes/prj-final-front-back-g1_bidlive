import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const HeroSection = () => {
    const [featured, setFeatured] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getAuctions('live')
            .then(data => {
                // Pick first live auction as featured
                setFeatured(Array.isArray(data) && data.length > 0 ? data[0] : null);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <section className="w-full">
                <div className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-surface-dark aspect-[21/9] min-h-[360px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                </div>
            </section>
        );
    }

    if (!featured) {
        return (
            <section className="w-full">
                <div className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-surface-dark aspect-[21/9] min-h-[360px] flex flex-col items-center justify-center gap-4 text-slate-900 dark:text-white border border-slate-200 dark:border-transparent">
                    <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-white/30">gavel</span>
                    <h2 className="text-2xl font-bold text-slate-500 dark:text-white/60">No live auctions right now</h2>
                    <Link to="/create-auction" className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-all shadow-md">
                        Start an Auction
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="w-full">
            <div className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-surface-dark group cursor-pointer aspect-[21/9] min-h-[360px] border border-slate-200 dark:border-transparent">
                {/* Background */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{
                        backgroundImage: featured.image_url
                            ? `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%), url('${featured.image_url}')`
                            : `linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.5))`
                    }}
                />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                    <div className="flex flex-col gap-4 max-w-2xl">
                        <div className="flex items-center gap-3">
                            <span className="bg-primary text-[10px] font-bold px-2 py-1 rounded text-white flex items-center gap-1 live-pulse uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 bg-white rounded-full"></span> Live
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
                            {featured.title}
                        </h1>

                        <p className="text-white/70 text-base md:text-lg">
                            Hosted by <span className="text-white font-semibold">{featured.seller || `User ${featured.seller_id}`}</span>
                            {' '}• Current Bid: <span className="text-white font-bold">€{featured.current_price || featured.starting_price}</span>
                        </p>

                        <div className="flex gap-4 pt-2">
                            <Link
                                to={`/auction/video/${featured.id}`}
                                className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg hover:-translate-y-1"
                            >
                                <span className="material-symbols-outlined">play_arrow</span>
                                Join Stream
                            </Link>
                            <Link
                                to={`/auction/photo/${featured.id}`}
                                className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-lg font-bold border border-white/20 hover:bg-white/20 transition-all hover:-translate-y-1"
                            >
                                View Details
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
