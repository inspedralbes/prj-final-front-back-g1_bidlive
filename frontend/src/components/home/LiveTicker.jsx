import React from 'react';

const LiveTicker = () => {
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-xl">
            <div className="bg-primary/20 backdrop-blur-xl border border-primary/30 rounded-full px-6 py-3 flex items-center gap-4 shadow-2xl overflow-hidden">
                <div className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">BID FEED</div>
                <div className="flex-1 overflow-hidden">
                    <div className="flex gap-8 whitespace-nowrap animate-marquee">
                        <span className="text-xs font-semibold dark:text-white"><span className="text-primary font-bold">@User882</span> just bid <span className="text-primary font-bold">$1,250</span> on Air Jordan 1</span>
                        <span className="text-xs font-semibold dark:text-white"><span className="text-primary font-bold">@VaultHunter</span> placed <span className="text-primary font-bold">$4,500</span> for Charizard PSA 10</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveTicker;
