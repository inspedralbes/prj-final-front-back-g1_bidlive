import React from 'react';
import { Link } from 'react-router-dom';

const ActiveListings = () => {
    const [listings, setListings] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/auction/pujas/live`)
            .then(res => res.json())
            .then(data => {
                setListings(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch active listings:", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <section className="h-48 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </section>
        );
    }

    return (
        <section>
            <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">shopping_bag</span> Active Listings
                </h2>
                <Link to="/explore" className="text-sm font-semibold text-primary hover:underline">View All</Link>
            </div>
            {listings.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {listings.map(item => (
                        <Link to={`/auction/photo/${item.id}`} key={item.id} className="bg-white dark:bg-surface-dark rounded-xl overflow-hidden border border-gray-200 dark:border-border-dark flex flex-col group cursor-pointer shadow-lg hover:shadow-primary/10 transition-shadow">
                            <div className="relative aspect-square">
                                <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{ backgroundImage: `url('${item.image_url}')` }}
                                ></div>
                                <div className="absolute top-2 left-2">
                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black tracking-tighter text-white ${item.status === 'live' ? 'bg-primary' : 'bg-slate-500'}`}>
                                        {item.status?.toUpperCase() || 'BIDDING'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-3">
                                <h4 className="text-xs font-bold line-clamp-1 mb-1">{item.title}</h4>
                                <div className="flex items-end justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase">Current Price</span>
                                        <span className="text-sm font-black text-slate-900 dark:text-white">${item.current_price || item.starting_price}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="w-full bg-primary/10 group-hover:bg-primary py-2 text-[10px] font-black tracking-widest text-primary group-hover:text-white uppercase transition-colors">
                                View Auction
                            </button>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white dark:bg-surface-dark rounded-xl border border-dashed border-slate-200 dark:border-border-dark">
                    <p className="text-slate-500">No active auctions at the moment.</p>
                </div>
            )}
        </section>
    );
};

export default ActiveListings;
