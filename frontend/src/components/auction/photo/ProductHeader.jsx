import React from 'react';

const ProductHeader = ({ auctionData }) => {
    if (!auctionData) return null;

    return (
        <div className="flex justify-between items-start pb-6 px-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">{auctionData.title}</h1>
                <p className="text-slate-500 dark:text-[#ba9ca1] mt-1 line-clamp-2">{auctionData.description}</p>
                <div className="flex items-center gap-4 mt-3">
                    {auctionData.status === 'live' && (
                        <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full live-pulse"></span>
                            Live Now
                        </div>
                    )}
                </div>
            </div>
            <button className="p-3 rounded-full bg-slate-200 dark:bg-[#39282b] text-slate-900 dark:text-white hover:text-primary transition-colors flex-shrink-0 ml-4">
                <span className="material-symbols-outlined">share</span>
            </button>
        </div>
    );
};

export default ProductHeader;
