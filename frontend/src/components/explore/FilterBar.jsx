import React from 'react';

const FilterBar = () => {
    return (
        <div className="flex flex-col gap-6 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex border-b border-slate-200 dark:border-border-dark gap-8">
                    <a href="#" className="border-b-2 border-primary text-primary pb-3 text-sm font-bold">All Auctions</a>
                    <a href="#" className="border-b-2 border-transparent text-slate-500 pb-3 text-sm font-bold hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Live Video</a>
                    <a href="#" className="border-b-2 border-transparent text-slate-500 pb-3 text-sm font-bold hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Ending Soon</a>
                    <a href="#" className="border-b-2 border-transparent text-slate-500 pb-3 text-sm font-bold hover:text-slate-700 dark:hover:text-slate-300 transition-colors">No Reserve</a>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">Sort by:</span>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-surface-dark text-sm font-semibold">
                        Ending Soonest
                        <span className="material-symbols-outlined text-sm">expand_more</span>
                    </button>
                </div>
            </div>
            <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold">
                    <span className="material-symbols-outlined text-sm">videocam</span>
                    Video Live
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-surface-dark text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    Price Range
                    <span className="material-symbols-outlined text-sm">expand_more</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-surface-dark text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    Category
                    <span className="material-symbols-outlined text-sm">expand_more</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-surface-dark text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    Condition
                    <span className="material-symbols-outlined text-sm">expand_more</span>
                </button>
                <div className="h-8 w-px bg-slate-200 dark:bg-border-dark mx-1 self-center"></div>
                <button className="text-primary text-sm font-bold hover:underline">Clear all filters</button>
            </div>
        </div>
    );
};

export default FilterBar;
