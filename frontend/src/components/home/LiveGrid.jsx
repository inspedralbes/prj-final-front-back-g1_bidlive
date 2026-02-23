import React from 'react';
import { Link } from 'react-router-dom';
import { usePujas } from '../../hooks/usePujas';

const AuctionCard = ({ auction }) => {
    const viewersCount = auction.viewers || Math.floor(Math.random() * 200) + 10;
    return (
        <Link
            to={`/auction/video/${auction.id}`}
            className="group block rounded-2xl overflow-hidden transition-transform duration-200 hover:-translate-y-1"
            style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
            }}
        >
            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden"
                style={{ background: '#1a1a2e' }}>
                {auction.img ? (
                    <img
                        src={auction.img}
                        alt={auction.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={e => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                    </div>
                )}

                {/* LIVE badge */}
                <div className="absolute top-3 left-3">
                    <span className="badge-live">
                        <span className="live-dot" /> LIVE
                    </span>
                </div>

                {/* Viewers */}
                <div className="absolute top-3 right-3 flex items-center gap-1 text-xs font-medium text-white px-2 py-1 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    {viewersCount}
                </div>

                {/* Price overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-white/60 text-xs">Current bid</p>
                            <p className="text-amber-400 font-black text-lg">{auction.bid || '$0'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom info */}
            <div className="p-4">
                <h3 className="text-white font-semibold text-sm leading-snug line-clamp-1 mb-1">
                    {auction.title}
                </h3>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-[10px] text-amber-400 font-bold">
                        {(auction.seller || 'S')[0].toUpperCase()}
                    </div>
                    <span className="text-gray-500 text-xs truncate">{auction.seller || 'Seller'}</span>
                </div>
            </div>
        </Link>
    );
};

const SkeletonCard = () => (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="aspect-video skeleton" />
        <div className="p-4 space-y-2">
            <div className="skeleton h-4 rounded w-3/4" />
            <div className="skeleton h-3 rounded w-1/2" />
        </div>
    </div>
);

export default function LiveGrid() {
    const { data: auctions, loading, error } = usePujas({ status: 'live' });

    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-white">Live now</h2>
                    {!loading && auctions.length > 0 && (
                        <span className="badge-live">
                            <span className="live-dot" /> {auctions.length} live
                        </span>
                    )}
                </div>
                <Link to="/explore" className="text-sm text-amber-400 hover:text-amber-300 transition-colors font-medium flex items-center gap-1">
                    See all
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </Link>
            </div>

            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            )}

            {error && !loading && (
                <div className="rounded-xl p-8 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <p className="text-gray-500 text-sm">Unable to load live auctions</p>
                </div>
            )}

            {!loading && !error && auctions.length === 0 && (
                <div className="rounded-xl p-12 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(245,158,11,0.7)" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>
                    </div>
                    <p className="text-gray-400 font-medium">No live auctions at the moment</p>
                    <p className="text-gray-600 text-sm mt-1">Check back soon or start your own!</p>
                    <Link to="/create-puja" className="btn-primary mt-5 inline-flex text-sm px-6 py-2.5">
                        Start an auction
                    </Link>
                </div>
            )}

            {!loading && !error && auctions.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {auctions.map(a => <AuctionCard key={a.id} auction={a} />)}
                </div>
            )}
        </section>
    );
}
