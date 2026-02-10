import React from 'react';

const BiddingHUD = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 rounded-xl p-6 bg-[#39282b] border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-6xl text-white">payments</span>
                </div>
                <p className="text-[#ba9ca1] text-sm font-medium uppercase tracking-wider">Current Bid</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-white tracking-tight text-4xl font-black leading-tight">€1,450</p>
                    <p className="text-[#0bda92] text-sm font-bold flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-xs">trending_up</span>
                        +€10
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-2 rounded-xl p-6 bg-primary/10 border border-primary/30">
                <p className="text-primary text-sm font-bold uppercase tracking-wider">Auction Ends In</p>
                <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                        <div className="text-3xl font-black text-white tabular-nums">00</div>
                        <div className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Hrs</div>
                    </div>
                    <div className="text-3xl font-black text-white/30">:</div>
                    <div className="flex flex-col items-center">
                        <div className="text-3xl font-black text-white tabular-nums">00</div>
                        <div className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Min</div>
                    </div>
                    <div className="text-3xl font-black text-white/30">:</div>
                    <div className="flex flex-col items-center">
                        <div className="text-3xl font-black text-primary tabular-nums">45</div>
                        <div className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Sec</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BiddingHUD;
