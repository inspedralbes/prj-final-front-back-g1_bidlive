import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import { usePujas } from '../hooks/usePujas';
import { useSellers } from '../hooks/useSellers';
import { useCategories } from '../hooks/useCategories';
import FavoriteButton from '../components/common/FavoriteButton';
import SellerCard from '../components/common/SellerCard';
import { useLanguage } from '../context/LanguageContext';

const getReputationStars = (sales) => {
    if (!sales || sales === 0) return { stars: 0, label: "New" };
    if (sales <= 5) return { stars: 1, label: "Beginner" };
    if (sales <= 15) return { stars: 2, label: "Regular" };
    if (sales <= 30) return { stars: 3, label: "Reliable" };
    if (sales <= 50) return { stars: 4, label: "Outstanding" };
    return { stars: 5, label: "Top" };
};

const statusColor = (status) => {
    if (status === 'live') return '#ef4444';
    if (status === 'active') return '#22c55e';
    return '#9ca3af';
};

const AuctionCard = ({ auction }) => (
    <div className="relative group">
        <FavoriteButton
            pujaId={auction.id}
            className="absolute top-3 right-3 z-20 bg-black/40 backdrop-blur-md text-white hover:text-red-500 p-2 rounded-xl border border-white/10 transition-all hover:scale-110"
        />
        <Link
            to={`/auction/video/${auction.id}`}
            className="block rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl h-full"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
            <div className="relative aspect-video overflow-hidden" style={{ background: '#1a1a2e' }}>
                {auction.img ? (
                    <img src={auction.img} alt={auction.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={e => { e.target.style.display = 'none'; }} />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3"
                        style={{ background: 'linear-gradient(135deg, #1e1e3f 0%, #111122 100%)' }}>
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                            <span className="material-symbols-outlined text-amber-400" style={{ fontSize: '32px' }}>
                                {auction.categoryIcon || 'category'}
                            </span>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 opacity-60">
                            {auction.categoryName || 'General'}
                        </p>
                    </div>
                )}
                {auction.status === 'live' && (
                    <div className="absolute top-3 left-3 badge-live">
                        <span className="live-dot" /> LIVE
                    </div>
                )}
                {/* Removed redundant category badge and added bidding info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)' }}>
                    <p className="text-amber-400 font-black text-lg">${Number(auction.currentPrice).toLocaleString()}</p>
                </div>
            </div>
            <div className="p-4">
                <h3 className="text-white font-semibold text-sm line-clamp-1 mb-2 group-hover:text-amber-400 transition-colors">{auction.title}</h3>
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-gray-400 text-xs font-medium">{auction.seller}</span>
                        <div className="flex items-center gap-0.5 mt-0.5">
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className={`material-symbols-outlined text-[10px] ${i < getReputationStars(auction.sellerTotalSales || 0).stars ? 'text-amber-400' : 'text-slate-600'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                    star
                                </span>
                            ))}
                        </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ color: statusColor(auction.status), background: `${statusColor(auction.status)}15`, border: `1px solid ${statusColor(auction.status)}30` }}>
                        {auction.status || 'active'}
                    </span>
                </div>
            </div>
        </Link>
    </div>
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
    const { t } = useLanguage();
    const [searchParams, setSearchParams] = useSearchParams();
    const [input, setInput] = useState(searchParams.get('q') || '');
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [activeCategoryId, setActiveCategoryId] = useState(searchParams.get('categoryId') || '');
    const [activeCategoryName, setActiveCategoryName] = useState(searchParams.get('categoryName') || '');
    const [searchType, setSearchType] = useState(searchParams.get('type') || 'auctions');

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
        if (searchType !== 'auctions') params.type = searchType;
        setSearchParams(params, { replace: true });
    }, [query, activeCategoryId, activeCategoryName, searchType, setSearchParams]);

    const { data: auctions, loading: loadingAuctions, error: errorAuctions } = usePujas({
        q: query || undefined,
        categoryId: activeCategoryId || undefined,
    });

    const { sellers, loading: loadingSellers, error: errorSellers } = useSellers({
        q: query || undefined
    });

    const loading = searchType === 'auctions' ? loadingAuctions : loadingSellers;
    const error = searchType === 'auctions' ? errorAuctions : errorSellers;
    const itemsCount = searchType === 'auctions' ? auctions.length : sellers.length;

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
                        Explore <span className="text-amber-400">{searchType === 'auctions' ? 'auctions' : 'sellers'}</span>
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
                                placeholder={searchType === 'auctions' ? "Search by item name..." : "Search by seller name or bio..."}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn-primary px-6">{t('search.searchBtn')}</button>
                    </form>
                </div>

                {/* Search Type Tabs */}
                <div className="flex justify-center gap-8 mb-10 border-b border-white/5">
                    <button
                        onClick={() => setSearchType('auctions')}
                        className={`pb-4 px-4 text-sm font-bold tracking-widest uppercase transition-all relative ${searchType === 'auctions' ? 'text-amber-400' : 'text-gray-500 hover:text-white'}`}
                    >
                        Subastas
                        {searchType === 'auctions' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-400 rounded-t-full" />}
                    </button>
                    <button
                        onClick={() => setSearchType('sellers')}
                        className={`pb-4 px-4 text-sm font-bold tracking-widest uppercase transition-all relative ${searchType === 'sellers' ? 'text-amber-400' : 'text-gray-500 hover:text-white'}`}
                    >
                        Vendedores
                        {searchType === 'sellers' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-400 rounded-t-full" />}
                    </button>
                </div>

                {/* Category pills - only for auctions */}
                {searchType === 'auctions' && categories.length > 0 && (
                    <div className="mb-8 flex flex-wrap gap-2 justify-center animate-fade-in">
                        <button
                            onClick={clearAll}
                            className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
                            style={
                                !activeCategoryId
                                    ? { background: '#f59e0b', color: '#08080f' }
                                    : { background: 'rgba(255,255,255,0.07)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)' }
                            }
                        >
                            {t('search.allBtn')}
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
                            : `${itemsCount} ${searchType === 'auctions' ? 'auction' : 'seller'}${itemsCount !== 1 ? 's' : ''} found${activeCategoryName ? ` in "${activeCategoryName}"` : ''}${query ? ` for "${query}"` : ''}`}
                    </p>
                    {hasFilters && (
                        <button
                            onClick={clearAll}
                            className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            {t('search.clearAll')}
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
                        <p className="text-gray-500 text-sm">{t('search.error')}</p>
                    </div>
                )}

                {!loading && !error && itemsCount === 0 && (
                    <div className="rounded-xl p-16 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                            style={{ background: 'rgba(245,158,11,0.1)' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(245,158,11,0.6)" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                        </div>
                        <p className="text-gray-400 font-medium text-lg">
                            {searchType === 'auctions' ? t('search.noTitle') : 'No sellers found'}
                        </p>
                        <p className="text-gray-600 text-sm mt-2">
                            {query ? `Try searching for something else.` : (searchType === 'auctions' ? 'Be the first to create an auction!' : 'Be the first seller!')}
                        </p>
                        {searchType === 'auctions' && !query && (
                            <Link to="/create-puja" className="btn-primary mt-6 inline-flex text-sm px-6 py-2.5">
                                {t('search.createBtn')}
                            </Link>
                        )}
                        {query && (
                            <button onClick={clearAll} className="btn-primary mt-6 inline-flex text-sm px-6 py-2.5">
                                Clear search
                            </button>
                        )}
                    </div>
                )}

                {!loading && !error && itemsCount > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                        {searchType === 'auctions'
                            ? auctions.map(a => <AuctionCard key={a.id} auction={a} />)
                            : sellers.map(s => <SellerCard key={s.id} seller={s} />)
                        }
                    </div>
                )}
            </main>
        </div>
    );
}
