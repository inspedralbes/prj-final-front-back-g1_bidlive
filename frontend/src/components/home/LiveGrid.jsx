import React from 'react';
import { Link } from 'react-router-dom';

const LiveGrid = () => {
    const [liveItems, setLiveItems] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/auction/pujas/live`)
            .then(res => res.json())
            .then(data => {
                setLiveItems(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch live auctions:", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <section className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </section>
        );
    }

    return (
        <section>
            <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">live_tv</span> Live Streams
                </h2>
                <div className="flex items-center gap-4">
                    <button className="text-xs font-bold bg-white dark:bg-surface-dark px-3 py-1.5 rounded-lg border border-gray-200 dark:border-border-dark">Filter: Most Viewers</button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {liveItems.map(item => (
                    <Link to={`/auction/video/${item.id}`} key={item.id} className="flex flex-col gap-3 group">
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-surface-dark shadow-2xl">
                            <div
                                className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                                style={{ backgroundImage: `url('${item.img}')` }}
                            ></div>
                            <div className="absolute top-2 left-2 flex gap-1">
                                <span className="bg-primary text-[10px] font-bold px-1.5 py-0.5 rounded text-white live-pulse">LIVE</span>
                                <span className="bg-black/60 text-[10px] font-bold px-1.5 py-0.5 rounded text-white flex items-center gap-0.5 backdrop-blur-md">
                                    <span className="material-symbols-outlined text-[12px]">visibility</span> {item.viewers}
                                </span>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button className="bg-primary text-white p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                    <span className="material-symbols-outlined text-3xl">play_arrow</span>
                                </button>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-start gap-3">
                                <div
                                    className="w-10 h-10 rounded-full bg-cover bg-center border border-border-dark"
                                    style={{ backgroundImage: `url('${item.sellerImg}')` }}
                                ></div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.seller}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="bg-gray-100 dark:bg-surface-dark px-2 py-0.5 rounded text-[10px] font-semibold">{item.category}</span>
                                        <span className="text-primary text-[10px] font-black tracking-wider uppercase">Bid: {item.bid}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default LiveGrid;
