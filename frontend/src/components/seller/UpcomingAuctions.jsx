import React from 'react';
import { usePujasByUser } from '../../hooks/usePujas';

const UpcomingAuctions = () => {
    // Get seller id
    const userStr = localStorage.getItem('user');
    const userObj = userStr ? JSON.parse(userStr) : {};
    const sellerId = userObj.id || 1;

    const { data: pujas, loading } = usePujasByUser(sellerId);

    // Filter for upcoming auctions
    const upcomingPujas = pujas.filter(p => p.status === 'upcoming');

    if (loading) {
        return (
            <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-border-dark overflow-hidden p-6 text-center text-slate-500">
                Loading upcoming auctions...
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-border-dark overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-border-dark flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Upcoming Scheduled</h3>
                <button className="text-sm font-bold text-primary hover:underline">Calendar</button>
            </div>
            <div className="p-4 space-y-4">
                {upcomingPujas.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No upcoming auctions scheduled.</p>
                ) : (
                    upcomingPujas.map(puja => (
                        <div key={puja.id} className="flex gap-4 p-4 border border-slate-200 dark:border-border-dark rounded-xl hover:border-primary/50 transition-colors group cursor-pointer">
                            <div className="bg-center bg-cover h-16 w-16 rounded-lg bg-gray-200" style={{ backgroundImage: `url('${puja.image_url || 'https://via.placeholder.com/150'}')` }}></div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{puja.title}</h4>
                                    <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded">Scheduled</span>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-[#ba9ca1] mt-1">Starting Price: ${puja.starting_price}</p>
                            </div>
                            <button className="self-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined">edit</span>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UpcomingAuctions;
