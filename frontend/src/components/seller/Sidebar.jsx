import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
    return (
        <aside className="w-64 bg-white dark:bg-background-dark border-r border-slate-200 dark:border-border-dark hidden lg:flex flex-col h-[calc(100vh-64px)] fixed top-[64px] left-0">
            <nav className="p-4 space-y-1">
                <Link to="/seller" className="flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary rounded-xl font-bold">
                    <span className="material-symbols-outlined">dashboard</span>
                    Overview
                </Link>
                <Link to="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-[#ba9ca1] hover:bg-slate-100 dark:hover:bg-surface-dark rounded-xl font-medium transition-colors">
                    <span className="material-symbols-outlined">inventory_2</span>
                    My Inventory
                </Link>
                <Link to="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-[#ba9ca1] hover:bg-slate-100 dark:hover:bg-surface-dark rounded-xl font-medium transition-colors">
                    <span className="material-symbols-outlined">gavel</span>
                    Active Auctions
                </Link>
                <Link to="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-[#ba9ca1] hover:bg-slate-100 dark:hover:bg-surface-dark rounded-xl font-medium transition-colors">
                    <span className="material-symbols-outlined">analytics</span>
                    Analytics
                </Link>
                <div className="pt-4 mt-4 border-t border-slate-200 dark:border-border-dark">
                    <h4 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Settings</h4>
                    <Link to="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-[#ba9ca1] hover:bg-slate-100 dark:hover:bg-surface-dark rounded-xl font-medium transition-colors">
                        <span className="material-symbols-outlined">account_circle</span>
                        Profile
                    </Link>
                    <Link to="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-[#ba9ca1] hover:bg-slate-100 dark:hover:bg-surface-dark rounded-xl font-medium transition-colors">
                        <span className="material-symbols-outlined">payments</span>
                        Payouts
                    </Link>
                </div>
            </nav>

            <div className="mt-auto p-4 border-t border-slate-200 dark:border-border-dark">
                <button className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors w-full px-4 py-2 font-medium">
                    <span className="material-symbols-outlined">logout</span>
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
