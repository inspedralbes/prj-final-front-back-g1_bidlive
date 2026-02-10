import React from 'react';

const StatsGrid = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Revenue */}
            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-border-dark shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-green-500/10 rounded-xl">
                        <span className="material-symbols-outlined text-green-500">attach_money</span>
                    </div>
                    <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">+12%</span>
                </div>
                <h3 className="text-slate-500 dark:text-[#ba9ca1] text-sm font-bold uppercase tracking-wider">Total Revenue</h3>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">$124,500</p>
            </div>

            {/* Active Auctions */}
            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-border-dark shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <span className="material-symbols-outlined text-primary">gavel</span>
                    </div>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">2 Live</span>
                </div>
                <h3 className="text-slate-500 dark:text-[#ba9ca1] text-sm font-bold uppercase tracking-wider">Active Auctions</h3>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">8</p>
            </div>

            {/* Items Sold */}
            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-border-dark shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                        <span className="material-symbols-outlined text-blue-500">inventory_2</span>
                    </div>
                </div>
                <h3 className="text-slate-500 dark:text-[#ba9ca1] text-sm font-bold uppercase tracking-wider">Items Sold</h3>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">142</p>
            </div>

            {/* Followers */}
            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-border-dark shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl">
                        <span className="material-symbols-outlined text-purple-500">group</span>
                    </div>
                    <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">+45</span>
                </div>
                <h3 className="text-slate-500 dark:text-[#ba9ca1] text-sm font-bold uppercase tracking-wider">Followers</h3>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">15.4k</p>
            </div>
        </div>
    );
};

export default StatsGrid;
