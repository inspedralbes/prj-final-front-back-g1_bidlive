import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import { usePujas } from '../hooks/usePujas';
import { useCategories } from '../hooks/useCategories';

const statusColor = (status) => {
    if (status === 'live') return '#ef4444';
    if (status === 'active') return '#22c55e';
    return '#9ca3af';
};

const AuctionCard = ({ auction }) => (
    <Link
        to={`/auction/video/${auction.id}`}
        className="group block rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
        <div className="relative aspect-video overflow-hidden" style={{ background: '#1a1a2e' }}>
            {auction.img ? (
                <img src={auction.img} alt={auction.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={e => { e.target.style.display = 'none'; }} />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                </div>
            )}
            {auction.status === 'live' && (
                <div className="absolute top-3 left-3 badge-live">
                    <span className="live-dot" /> LIVE
                </div>
            )}
            {auction.category && auction.category !== 'Sin categoría' && (
                <div className="absolute top-3 right-3 flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(245,158,11,0.9)', color: '#08080f' }}>
                    {auction.categoryIcon && (
                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>{auction.categoryIcon}</span>
                    )}
                    {auction.category}
                </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-3"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)' }}>
                <p className="text-amber-400 font-black text-lg">{auction.bid || '$0'}</p>
            </div>
        </div>
        <div className="p-4">
            <h3 className="text-white font-semibold text-sm line-clamp-1 mb-2">{auction.title}</h3>
            <div className="flex items-center justify-between">
                <span className="text-gray-500 text-xs">{auction.seller}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ color: statusColor(auction.status), background: `${statusColor(auction.status)}15`, border: `1px solid ${statusColor(auction.status)}30` }}>
                    {auction.status || 'active'}
                </span>
            </div>
        </div>
    </Link>
);

const SkeletonCard = () => (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="aspect-video skeleton" />
        <div className="p-4 space-y-2">
            <div className="skeleton h-4 rounded w-3/4" />
            <div className="skeleton h-3 rounded w-1/2" />
        </div>
    </div>
);

export default function Search() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [input, setInput] = useState(searchParams.get('q') || '');
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [activeCategoryId, setActiveCategoryId] = useState(searchParams.get('categoryId') || '');
    const [activeCategoryName, setActiveCategoryName] = useState(searchParams.get('categoryName') || '');

    const { categories } = useCategories();

    // Sync URL → state on mount
    useEffect(() => {
        setActiveCategoryId(searchParams.get('categoryId') || '');
        setActiveCategoryName(searchParams.get('categoryName') || '');
        setQuery(searchParams.get('q') || '');
        setInput(searchParams.get('q') || '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sync state → URL
    useEffect(() => {
        const params = {};
        if (query) params.q = query;
        if (activeCategoryId) {
            params.categoryId = activeCategoryId;
            params.categoryName = activeCategoryName;
        }
        setSearchParams(params, { replace: true });
    }, [query, activeCategoryId, activeCategoryName, setSearchParams]);

    const { data: auctions, loading, error } = usePujas({
        q: query || undefined,
        categoryId: activeCategoryId || undefined,
    });

    const handleSearch = (e) => {
        e.preventDefault();
        setQuery(input.trim());
    };

    const handleCategorySelect = (cat) => {
        if (activeCategoryId === String(cat.id)) {
            // Toggle off
            setActiveCategoryId('');
            setActiveCategoryName('');
        } else {
            setActiveCategoryId(String(cat.id));
            setActiveCategoryName(cat.name);
        }
    };

    const clearAll = () => {
        setQuery('');
        setInput('');
        setActiveCategoryId('');
        setActiveCategoryName('');
    };

    const hasFilters = query || activeCategoryId;

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Search bar */}
                <div className="max-w-2xl mx-auto mb-10">
                    <h1 className="text-4xl font-black text-white text-center mb-8">
                        Explore <span className="text-amber-400">auctions</span>
                    </h1>
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="relative flex-1">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" width="18" height="18"
                                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                            </svg>
                            <input
                                className="input-field pl-11"
                                type="text"
                                placeholder="Search by item name..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn-primary px-6">Search</button>
                    </form>
                </div>

                {/* Category pills */}
                {categories.length > 0 && (
                    <div className="mb-8 flex flex-wrap gap-2 justify-center">
                        <button
                            onClick={clearAll}
                            className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
                            style={
                                !activeCategoryId
                                    ? { background: '#f59e0b', color: '#08080f' }
                                    : { background: 'rgba(255,255,255,0.07)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)' }
                            }
                        >
                            All
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategorySelect(cat)}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
                                style={
                                    activeCategoryId === String(cat.id)
                                        ? { background: '#f59e0b', color: '#08080f' }
                                        : { background: 'rgba(255,255,255,0.07)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)' }
                                }
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{cat.icon}</span>
                                {cat.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Results header */}
                <div className="flex items-center justify-between mb-5">
                    <p className="text-gray-400 text-sm">
                        {loading
                            ? 'Searching...'
                            : `${auctions.length} auction${auctions.length !== 1 ? 's' : ''} found${activeCategoryName ? ` in "${activeCategoryName}"` : ''}${query ? ` for "${query}"` : ''}`}
                    </p>
                    {hasFilters && (
                        <button
                            onClick={clearAll}
                            className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            Clear all filters
                        </button>
                    )}
                </div>

                {/* Grid */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                )}

                {error && !loading && (
                    <div className="rounded-xl p-8 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        <p className="text-gray-500 text-sm">Unable to load auctions. Please try again.</p>
                    </div>
                )}

                {!loading && !error && auctions.length === 0 && (
                    <div className="rounded-xl p-16 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                            style={{ background: 'rgba(245,158,11,0.1)' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(245,158,11,0.6)" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                        </div>
                        <p className="text-gray-400 font-medium text-lg">No auctions found</p>
                        <p className="text-gray-600 text-sm mt-2">
                            {hasFilters ? 'No results for the current filters.' : 'Be the first to create an auction!'}
                        </p>
                        {hasFilters ? (
                            <button onClick={clearAll} className="btn-primary mt-6 inline-flex text-sm px-6 py-2.5">
                                Clear filters
                            </button>
                        ) : (
                            <Link to="/create-puja" className="btn-primary mt-6 inline-flex text-sm px-6 py-2.5">
                                Create auction
                            </Link>
                        )}
                    </div>
                )}

                {!loading && !error && auctions.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {auctions.map(a => <AuctionCard key={a.id} auction={a} />)}
                    </div>
                )}
            </main>
        </div>
    );
}
