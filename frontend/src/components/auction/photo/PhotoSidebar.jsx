import React from 'react';

const PhotoSidebar = () => {
    return (
        <aside className="w-full lg:w-[420px] border-l border-slate-200 dark:border-[#39282b] flex flex-col bg-background-light dark:bg-background-dark h-full">
            {/* Live Status & Stats */}
            <div className="p-6 border-b border-slate-200 dark:border-[#39282b] space-y-4 text-slate-900 dark:text-white">
                <div className="flex justify-between items-center">
                    <span className="text-slate-400 dark:text-[#ba9ca1] text-sm font-medium uppercase tracking-wider">Current Bid</span>
                    <span className="text-slate-400 dark:text-[#ba9ca1] text-sm font-medium uppercase tracking-wider">Time Left</span>
                </div>
                <div className="flex justify-between items-end">
                    <div className="text-4xl font-black">$42,500</div>
                    <div className="text-2xl font-bold text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-2xl">timer</span>
                        02:45
                    </div>
                </div>
                <div className="bg-primary/10 rounded-lg p-3 border border-primary/20 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">campaign</span>
                    <p className="text-xs text-primary font-bold leading-tight">High bid held by M***s. Minimum next bid: $42,600</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex border-b border-slate-200 dark:border-[#39282b]">
                    <button className="flex-1 py-4 text-sm font-bold border-b-2 border-primary text-primary">Bid History</button>
                    <button className="flex-1 py-4 text-sm font-bold text-slate-400 dark:text-[#ba9ca1] hover:text-slate-900 dark:hover:text-white transition-colors">Live Chat</button>
                </div>

                {/* Bid History List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
                    <div className="flex justify-between items-center bg-primary/5 p-3 rounded-lg border border-primary/10">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">M</div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">M***s <span className="text-[10px] ml-2 text-primary uppercase font-black">Winning</span></p>
                                <p className="text-[10px] text-slate-500 dark:text-[#ba9ca1]">30 seconds ago</p>
                            </div>
                        </div>
                        <p className="text-base font-bold text-slate-900 dark:text-white">$42,500</p>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-lg opacity-80">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 text-xs font-bold">K</div>
                            <div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">K***n</p>
                                <p className="text-[10px] text-slate-500 dark:text-[#ba9ca1]">2 minutes ago</p>
                            </div>
                        </div>
                        <p className="text-base font-bold text-slate-700 dark:text-slate-300">$42,100</p>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-lg opacity-60">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 text-xs font-bold">A</div>
                            <div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">A***x</p>
                                <p className="text-[10px] text-slate-500 dark:text-[#ba9ca1]">5 minutes ago</p>
                            </div>
                        </div>
                        <p className="text-base font-bold text-slate-700 dark:text-slate-300">$41,500</p>
                    </div>
                </div>
            </div>

            {/* Bidding Console */}
            <div className="p-6 bg-slate-100 dark:bg-[#2a1a1c] border-t border-slate-200 dark:border-[#39282b]">
                <div className="flex gap-2 mb-4">
                    <button className="flex-1 py-2 bg-white dark:bg-white/10 rounded-lg text-xs font-bold border border-slate-300 dark:border-white/10 hover:bg-primary/20 hover:border-primary/50 transition-all text-slate-900 dark:text-white">+$100</button>
                    <button className="flex-1 py-2 bg-white dark:bg-white/10 rounded-lg text-xs font-bold border border-slate-300 dark:border-white/10 hover:bg-primary/20 hover:border-primary/50 transition-all text-slate-900 dark:text-white">+$500</button>
                    <button className="flex-1 py-2 bg-white dark:bg-white/10 rounded-lg text-xs font-bold border border-slate-300 dark:border-white/10 hover:bg-primary/20 hover:border-primary/50 transition-all text-slate-900 dark:text-white">+$1,000</button>
                </div>
                <div className="flex flex-col gap-3">
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                        <input
                            className="w-full bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl py-4 pl-8 pr-4 text-xl font-bold focus:ring-primary focus:border-primary text-slate-900 dark:text-white"
                            placeholder="Enter bid amount"
                            type="number"
                            defaultValue="42600"
                        />
                    </div>
                    <button className="w-full bg-primary hover:bg-primary/90 text-white font-black text-xl py-5 rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                        <span className="material-symbols-outlined text-3xl">gavel</span>
                        PLACE BID
                    </button>
                    <p className="text-[10px] text-center text-slate-500 dark:text-[#ba9ca1] px-4">By placing a bid, you agree to the auction terms and conditions.</p>
                </div>
            </div>
        </aside>
    );
};

export default PhotoSidebar;
