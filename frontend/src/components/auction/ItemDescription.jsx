import React from 'react';

const ItemDescription = ({ auctionData }) => {
    if (!auctionData) return null;

    return (
        <div className="bg-slate-50 dark:bg-[#39282b]/40 rounded-xl p-6 border border-slate-200 dark:border-white/5">
            <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">{auctionData.title || 'Auction Item'}</h3>
            <p className="text-slate-600 dark:text-[#ba9ca1] text-sm leading-relaxed whitespace-pre-wrap">
                {auctionData.description || 'No description provided.'}
            </p>
        </div>
    );
};

export default ItemDescription;
