import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-border-dark px-6 md:px-10 lg:px-20 py-3">
            <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-8">
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined text-3xl font-bold">gavel</span>
                        <h2 className="text-xl font-black tracking-tight dark:text-white">BidLive</h2>
                    </Link>
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/explore" className="text-sm font-semibold hover:text-primary transition-colors dark:text-white/80">Live</Link>
                        <Link to="/explore" className="text-sm font-semibold hover:text-primary transition-colors dark:text-white/80">Upcoming</Link>
                        <Link to="/seller" className="text-sm font-semibold hover:text-primary transition-colors dark:text-white/80">Auctioneers</Link>
                    </div>
                </div>

                <div className="flex-1 max-w-md hidden lg:block">
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary">search</span>
                        <input
                            type="text"
                            placeholder="Search sneakers, art, cards..."
                            className="w-full bg-gray-100 dark:bg-surface-dark border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-500 text-slate-900 dark:text-white"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Link to="/create-auction" className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-transform active:scale-95">
                        <span className="material-symbols-outlined text-sm">videocam</span>
                        <span className="hidden sm:inline">Go Live</span>
                    </Link>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-surface-dark rounded-lg relative text-slate-700 dark:text-white">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background-dark"></span>
                    </button>
                    <div
                        className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-orange-400 border-2 border-white dark:border-border-dark cursor-pointer shadow-lg"
                    ></div>
                </div>
            </div>
        </header>
    );
};

export default Header;
