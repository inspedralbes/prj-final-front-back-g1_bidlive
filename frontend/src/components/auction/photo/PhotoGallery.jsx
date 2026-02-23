import React from 'react';

const PhotoGallery = ({ auctionData }) => {
    if (!auctionData) return null;

    return (
        <div className="px-6 py-4 flex-1">
            <div className="w-full h-full min-h-[400px] bg-slate-200 dark:bg-[#201516] rounded-2xl overflow-hidden border border-slate-300 dark:border-[#39282b] relative group flex items-center justify-center">
                {auctionData.img || auctionData.image_url ? (
                    <img
                        src={auctionData.img || auctionData.image_url}
                        alt={auctionData.title}
                        className="max-w-full max-h-[600px] object-contain transition-transform duration-700"
                    />
                ) : (
                    <span className="material-symbols-outlined text-6xl text-slate-400 dark:text-[#39282b]">image</span>
                )}
            </div>
        </div>
    );
};

export default PhotoGallery;
