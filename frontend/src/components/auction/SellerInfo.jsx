import React from 'react';

const SellerInfo = ({ auctionData }) => {
    if (!auctionData) return null;

    const sellerName = auctionData.seller || `User ${auctionData.sellerId}`;

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-[#39282b] pb-6">
            <div className="flex gap-4 items-center">
                <div className="h-16 w-16 shadow-lg border-2 border-primary/20 rounded-xl bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-2xl font-bold text-white uppercase">
                    {sellerName.charAt(0)}
                </div>
                <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                        <p className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">{sellerName}</p>
                        <span className="material-symbols-outlined text-blue-500 text-sm">verified</span>
                    </div>
                </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
                <button className="flex-1 md:flex-none flex min-w-[100px] cursor-pointer items-center justify-center gap-2 rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold transition-all hover:bg-primary/80">
                    <span className="material-symbols-outlined text-lg">person_add</span>
                    Follow
                </button>
                <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-200 dark:bg-[#39282b] text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-white/10 transition-colors">
                    <span className="material-symbols-outlined">share</span>
                </button>
            </div>
        </div>
    );
};

export default SellerInfo;
