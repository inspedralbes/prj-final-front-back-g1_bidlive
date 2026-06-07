import React from 'react';
import { useSearchParams } from 'react-router-dom';

const FilterBar = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentStatus = searchParams.get('status') || '';

    const handleStatusChange = (status) => {
        const newParams = new URLSearchParams(searchParams);
        if (status) {
            newParams.set('status', status);
        } else {
            newParams.delete('status');
        }
        setSearchParams(newParams);
    };

    const isActive = (status) => currentStatus === status;

    return (
        <div className="flex flex-col gap-6 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex border-b border-slate-200 dark:border-border-dark gap-8">
                    <button
                        onClick={() => handleStatusChange('')}
                        className={`border-b-2 pb-3 text-sm font-bold transition-colors ${isActive('') ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        All Auctions
                    </button>
                    <button
                        onClick={() => handleStatusChange('live')}
                        className={`border-b-2 pb-3 text-sm font-bold transition-colors ${isActive('live') ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Live Video
                    </button>
                    <button
                        onClick={() => handleStatusChange('upcoming')}
                        className={`border-b-2 pb-3 text-sm font-bold transition-colors ${isActive('upcoming') ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Upcoming
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">Sort by:</span>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-surface-dark text-sm font-semibold">
                        Ending Soonest
                        <span className="material-symbols-outlined text-sm">expand_more</span>
                    </button>
                </div>
            </div>

            {(currentStatus || searchParams.get('q')) && (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-500">Active Filters:</span>
                    {currentStatus && (
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold capitalize">
                            Status: {currentStatus}
                        </span>
                    )}
                    {searchParams.get('q') && (
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                            Search: {searchParams.get('q')}
                        </span>
                    )}
                    <button
                        onClick={() => setSearchParams({})}
                        className="text-xs text-red-500 font-bold hover:underline ml-2"
                    >
                        Clear All
                    </button>
                </div>
            )}
        </div>
    );
};

export default FilterBar;
