import React from 'react';

const AuctioneerRail = () => {
    const [auctioneers, setAuctioneers] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetch('/api/auction/auctioneers')
            .then(res => res.json())
            .then(data => {
                setAuctioneers(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch auctioneers:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return null;

    return (
        <section>
            <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">verified</span> Popular Auctioneers
                </h2>
                <a href="#" className="text-sm font-semibold text-primary hover:underline">See All</a>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar no-scrollbar">
                {auctioneers.map((auctioneer, index) => (
                    <div key={index} className="flex flex-col items-center gap-2 min-w-[100px] cursor-pointer group">
                        <div className="relative">
                            <div className={`w-20 h-20 rounded-full p-1 ${auctioneer.online ? 'bg-gradient-to-tr from-primary to-purple-500' : 'bg-gray-600'}`}>
                                <div
                                    className="w-full h-full rounded-full bg-cover bg-center border-2 border-background-dark"
                                    style={{ backgroundImage: `url('${auctioneer.img}')` }}
                                ></div>
                            </div>
                            {auctioneer.online && (
                                <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-background-dark rounded-full"></span>
                            )}
                        </div>
                        <p className="text-xs font-bold text-center group-hover:text-primary transition-colors">{auctioneer.name}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default AuctioneerRail;
