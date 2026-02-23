import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const AuctioneerRail = () => {
    const [auctioneers, setAuctioneers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getTopSellers()
            .then(data => {
                setAuctioneers(data.slice(0, 10)); // Top 10
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch auctioneers:", err);
                setLoading(false);
            });
    }, []);

    if (loading || auctioneers.length === 0) return null;

    return (
        <section>
            <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    <span className="material-symbols-outlined text-primary">verified</span> Top Sellers
                </h2>
                <Link to="/auctioneers" className="text-sm font-semibold text-primary hover:underline">See All</Link>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar no-scrollbar">
                {auctioneers.map((auctioneer, index) => (
                    <div key={index} className="flex flex-col items-center gap-2 min-w-[100px] cursor-pointer group">
                        <div className="relative">
                            <div className={`w-20 h-20 rounded-full p-1 transition-transform group-hover:scale-105 duration-300 ${auctioneer.online ? 'bg-gradient-to-tr from-primary to-orange-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                <div className="w-full h-full rounded-full bg-white dark:bg-surface-dark border-2 border-white dark:border-background-dark flex items-center justify-center overflow-hidden">
                                    <span className="text-2xl font-black text-slate-900 dark:text-white uppercase">{auctioneer.name.charAt(0)}</span>
                                </div>
                            </div>
                            {auctioneer.online && (
                                <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-background-dark rounded-full shadow-sm"></span>
                            )}
                        </div>
                        <p className="text-xs font-bold text-center text-slate-900 dark:text-white group-hover:text-primary transition-colors max-w-[90px] truncate">{auctioneer.name}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default AuctioneerRail;
