import React from 'react';
import { Link } from 'react-router-dom';

const ViewerHeader = () => {
    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-background-dark/10 dark:border-[#39282b] px-6 py-3 bg-background-light dark:bg-background-dark">
            <div className="flex items-center gap-8">
                <Link to="/" className="flex items-center gap-4 text-primary">
                    <div className="size-6">
                        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                            <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
                        </svg>
                    </div>
                    <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">LiveAuction</h2>
                </Link>
                <label className="hidden md:flex flex-col min-w-40 h-10 max-w-64">
                    <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                        <div className="text-[#ba9ca1] flex border-none bg-black/10 dark:bg-[#39282b] items-center justify-center pl-4 rounded-l-lg border-r-0">
                            <span className="material-symbols-outlined text-xl">search</span>
                        </div>
                        <input
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-0 border-none bg-black/10 dark:bg-[#39282b] focus:border-none h-full placeholder:text-[#ba9ca1] px-4 rounded-l-none border-l-0 pl-2 text-sm font-normal"
                            placeholder="Search auctions..."
                            value=""
                            readOnly
                        />
                    </div>
                </label>
            </div>
            <div className="flex flex-1 justify-end gap-6 items-center">
                <nav className="hidden lg:flex items-center gap-8">
                    <Link to="/explore" className="text-slate-600 dark:text-white/80 hover:text-primary dark:hover:text-white text-sm font-medium transition-colors">Browse</Link>
                    <a className="text-slate-600 dark:text-white/80 hover:text-primary dark:hover:text-white text-sm font-medium transition-colors" href="#">Watchlist</a>
                    <a className="text-slate-600 dark:text-white/80 hover:text-primary dark:hover:text-white text-sm font-medium transition-colors" href="#">My Bids</a>
                </nav>
                <div className="flex gap-2">
                    <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-black/10 dark:bg-[#39282b] text-slate-700 dark:text-white transition-colors hover:bg-primary/20">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-black/10 dark:bg-[#39282b] text-slate-700 dark:text-white transition-colors hover:bg-primary/20">
                        <span className="material-symbols-outlined">person</span>
                    </button>
                </div>
                <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-10 w-10 ring-2 ring-primary/20"
                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCK0mC9rPuJ1bi7pkr8nAyM3uRpL0nXHvN77LLUsGDq8Xt5qofEq4q_lw3YjvdCX2i92czXsGGbHMoXYemvUxG3SAbAs5UKHfWJbLMPWVwTW4y8N6AshF02RtKdDBI9OvsDha1_zG_n8J6gLNmqDlpQAYr2hdSqehUCcxtdFLbFTnAv1iqAN2D3HSTUqOpbZRWVu4S4IMRQpZILSaRUohSvNxP-K0YwroL_vgAe4N6ovoF3asxGLYAlgmL_VzsKf-k2yz7rehxf9eyw')" }}
                ></div>
            </div>
        </header>
    );
};

export default ViewerHeader;
