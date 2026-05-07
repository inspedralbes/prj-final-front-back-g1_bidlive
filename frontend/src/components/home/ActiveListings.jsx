import React from 'react';
import { Link } from 'react-router-dom';
import { usePujas } from '../../hooks/usePujas';
import FavoriteButton from '../common/FavoriteButton';
import { useLanguage } from '../../context/LanguageContext';

const statusColor = (status) => {
    if (status === 'live') return { text: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' };
    if (status === 'active') return { text: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' };
    return { text: '#9ca3af', bg: 'rgba(156,163,175,0.1)', border: 'rgba(156,163,175,0.2)' };
};

const getReputationStars = (sales) => {
    if (!sales || sales === 0) return { stars: 0, label: "New" };
    if (sales <= 5) return { stars: 1, label: "Beginner" };
    if (sales <= 15) return { stars: 2, label: "Regular" };
    if (sales <= 30) return { stars: 3, label: "Reliable" };
    if (sales <= 50) return { stars: 4, label: "Outstanding" };
    return { stars: 5, label: "Top" };
};

const SkeletonRow = () => (
    <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="skeleton w-12 h-12 rounded-lg" />
        <div className="flex-1 space-y-2">
            <div className="skeleton h-4 rounded w-1/2" />
            <div className="skeleton h-3 rounded w-1/3" />
        </div>
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-4 w-16 rounded" />
    </div>
);

export default function ActiveListings() {
    const { data: allAuctions, loading, error } = usePujas();
    const { t } = useLanguage();
    // Only show live and upcoming auctions — ended ones are hidden from viewers
    const auctions = allAuctions.filter(a => a.status !== 'ended');

    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-white">{t('activeListings.title')}</h2>
                <Link to="/explore" className="text-sm text-amber-400 hover:text-amber-300 transition-colors font-medium flex items-center gap-1">
                    {t('activeListings.browseAll')}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </Link>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                {loading && (
                    <div className="p-4 space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
                    </div>
                )}

                {error && !loading && (
                    <div className="p-8 text-center">
                        <p className="text-gray-500 text-sm">{t('activeListings.error')}</p>
                    </div>
                )}

                {!loading && !error && auctions.length === 0 && (
                    <div className="p-12 text-center">
                        <p className="text-gray-400 font-medium">{t('activeListings.emptyTitle')}</p>
                        <p className="text-gray-600 text-sm mt-1">{t('activeListings.emptySub')}</p>
                        <Link to="/create-puja" className="btn-primary mt-5 inline-flex text-sm px-6 py-2.5">
                            {t('activeListings.createBtn')}
                        </Link>
                    </div>
                )}

                {!loading && !error && auctions.length > 0 && (
                    <>
                        {/* Header row */}
                        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b"
                            style={{ borderColor: 'var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                            <span className="col-span-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('activeListings.colItem')}</span>
                            <span className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('activeListings.colSeller')}</span>
                            <span className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('activeListings.colStatus')}</span>
                            <span className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">{t('activeListings.colBid')}</span>
                            <span className="col-span-1" />
                        </div>

                        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                            {auctions.map((a, idx) => {
                                const col = statusColor(a.status);
                                return (
                                    <div
                                        key={a.id}
                                        className="grid grid-cols-12 gap-4 items-center px-5 py-4 hover:bg-white/[0.02] transition-colors animate-fade-in"
                                        style={{ animationDelay: `${idx * 40}ms` }}
                                    >
                                        {/* Item */}
                                        <div className="col-span-10 md:col-span-5 flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0"
                                                style={{ background: '#1a1a2e', border: '1px solid var(--border)' }}>
                                                {a.img
                                                    ? <img src={a.img} alt={a.title} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                                                    : <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                                                    </div>
                                                }
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-white font-semibold text-sm truncate">{a.title}</p>
                                                <p className="text-gray-500 text-xs truncate md:hidden">{a.seller}</p>
                                            </div>
                                        </div>

                                        {/* Seller - desktop */}
                                        <div className="hidden md:flex flex-col col-span-2">
                                            <p className="text-gray-400 text-sm truncate leading-tight">{a.seller}</p>
                                            <div className="flex items-center gap-0.5 mt-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className={`material-symbols-outlined text-[10px] ${i < getReputationStars(a.sellerTotalSales || 0).stars ? 'text-amber-400' : 'text-slate-600'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                                        star
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="hidden md:flex col-span-2 items-center">
                                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: col.text, background: col.bg, border: `1px solid ${col.border}` }}>
                                                {a.status === 'live' ? `● ${t('activeListings.statusLive')}` : a.status || 'active'}
                                            </span>
                                        </div>

                                        {/* Bid */}
                                        <div className="hidden md:block col-span-2 text-right">
                                            <p className="text-amber-400 font-bold text-sm">{a.bid || '$0'}</p>
                                        </div>

                                        {/* CTA */}
                                        <div className="col-span-2 md:col-span-1 flex justify-end items-center gap-3">
                                            <FavoriteButton pujaId={a.id} className="text-gray-500 hover:text-red-500" />
                                            <Link
                                                to={`/auction/video/${a.id}`}
                                                className="btn-primary text-xs py-2 px-3 gap-1"
                                            >
                                                {a.status === 'live' ? t('activeListings.actionJoin') : t('activeListings.actionView')}
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
