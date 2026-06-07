import React from 'react';

const LiveTicker = () => {

    const [bids, setBids] = React.useState([]);

    React.useEffect(() => {
        fetch('/api/bids/recent')
            .then(res => res.json())
            .then(data => setBids(data))
            .catch(err => console.error("Failed to fetch recent bids:", err));
    }, []);

    if (bids.length === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-xl">
            <div className="bg-primary/20 backdrop-blur-xl border border-primary/30 rounded-full px-6 py-3 flex items-center gap-4 shadow-2xl overflow-hidden">
                <div className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">BID FEED</div>
                <div className="flex-1 overflow-hidden">
                    <div className="flex gap-8 whitespace-nowrap animate-marquee">
                        {bids.map((bid, index) => (
                            <span key={index} className="text-xs font-semibold dark:text-white">
                                <span className="text-primary font-bold">{bid.user}</span> just bid <span className="text-primary font-bold">{bid.bid}</span> on {bid.item}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveTicker;
