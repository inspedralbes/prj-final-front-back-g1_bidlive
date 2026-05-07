import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePujasByUser } from '../hooks/usePujas';
import Header from '../components/layout/Header';
import { useLanguage } from '../context/LanguageContext';

const statusColor = (status) => {
    if (status === 'live') return { text: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Live' };
    if (status === 'ended') return { text: '#6b7280', bg: 'rgba(107,114,128,0.1)', label: 'Ended' };
    if (status === 'cancelled_unpaid') return { text: '#f87171', bg: 'rgba(248,113,113,0.1)', label: 'Unpaid' };
    return { text: '#9ca3af', bg: 'rgba(156,163,175,0.1)', label: 'Upcoming' };
};

const StatCard = ({ label, value, icon, accent }) => (
    <div className="rounded-2xl p-5 flex items-center gap-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: accent ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.05)' }}>
            {icon}
        </div>
        <div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-white font-black text-2xl">{value}</p>
        </div>
    </div>
);

const SkeletonRow = () => (
    <div className="flex items-center gap-4 p-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="skeleton w-10 h-10 rounded-lg" />
        <div className="flex-1 space-y-2">
            <div className="skeleton h-3.5 rounded w-1/2" />
            <div className="skeleton h-3 rounded w-1/3" />
        </div>
        <div className="skeleton h-5 w-14 rounded-full" />
        <div className="skeleton h-8 w-20 rounded-lg" />
    </div>
);

export default function SellerDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { data: pujas, loading, refetch } = usePujasByUser(user?.id);
    const { t } = useLanguage();

    // Force a fresh fetch every time the dashboard mounts OR the user navigates back to it.
    // location.key changes on every navigation event, ensuring we always get fresh data.
    useEffect(() => {
        if (user?.id) refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, location.key]);

    const activePujas = pujas.filter(p => !['ended', 'cancelled_unpaid'].includes(p.status));
    const endedPujas = pujas.filter(p => ['ended', 'cancelled_unpaid'].includes(p.status));

    const total = pujas.length;
    const live = pujas.filter(p => p.status === 'live').length;
    // Use normalized currentPrice field (mapped by usePujas.js)
    const revenue = pujas.reduce((sum, p) => sum + parseFloat(String(p.currentPrice || p.current_price || 0)), 0);

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
            <Header />
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Title */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white">{t('dashboard.title')}</h1>
                        <p className="text-gray-500 mt-1">
                            {t('dashboard.welcome')} <span className="text-amber-400 font-semibold">{user?.username || user?.email}</span>
                        </p>
                    </div>
                    <Link to="/create-puja" className="btn-primary gap-2">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                        {t('dashboard.newBtn')}
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                    <StatCard label={t('dashboard.totalAuctions')} value={total} accent icon={
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>
                    } />
                    <StatCard label={t('dashboard.liveNow')} value={live} icon={
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8"><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>
                    } />
                    <StatCard label={t('dashboard.totalValue')} value={`$${revenue.toLocaleString()}`} icon={
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                    } />
                </div>

                {/* Auctions table */}
                <div className="mb-12">
                    <h2 className="text-xl font-black text-white mb-4">{t('dashboard.myAuctions')}</h2>
                    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3"
                            style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                            {[t('dashboard.colItem'), t('dashboard.colStatus'), t('dashboard.colStarting'), t('dashboard.colActions')].map((h, i) => (
                                <span key={h} className={`text-xs font-semibold text-gray-500 uppercase tracking-wider ${i === 3 ? 'col-span-2 text-right' : i === 0 ? 'col-span-5' : 'col-span-2'}`}>{h}</span>
                            ))}
                        </div>

                        {loading && (
                            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                                {[0, 1].map(i => <SkeletonRow key={i} />)}
                            </div>
                        )}

                        {!loading && activePujas.length === 0 && (
                            <div className="p-16 text-center">
                                <p className="text-gray-400 font-semibold mb-2">{t('dashboard.noActive')}</p>
                                <Link to="/create-puja" className="btn-primary text-sm px-6 py-2.5">{t('dashboard.createFirst')}</Link>
                            </div>
                        )}

                        {!loading && activePujas.length > 0 && (
                            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                                {activePujas.map((p, idx) => {
                                    const col = statusColor(p.status, t);
                                    const price = p.currentPrice ?? p.current_price ?? p.startingPrice ?? p.starting_price ?? 0;
                                    return (
                                        <div key={p.id} className="grid grid-cols-12 gap-4 items-center px-5 py-4 hover:bg-white/[0.02] transition-colors">
                                            <div className="col-span-10 md:col-span-5 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0" style={{ background: '#1a1a2e', border: '1px solid var(--border)' }}>
                                                    {p.image_url || p.img ? <img src={p.image_url || p.img} alt={p.title} className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} /> : <div className="w-full h-full flex items-center justify-center text-gray-700"></div>}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-white font-semibold text-sm truncate">{p.title}</p>
                                                    <p className="text-gray-600 text-xs">#{p.id}</p>
                                                </div>
                                            </div>
                                            <div className="hidden md:flex col-span-2 items-center">
                                                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color: col.text, background: col.bg }}>{col.label}</span>
                                            </div>
                                            <div className="hidden md:block col-span-2">
                                                <p className="text-amber-400 font-bold text-sm">${Number(price).toLocaleString()}</p>
                                            </div>
                                            <div className="col-span-2 md:col-span-3 flex justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/seller/live/video/${p.id}`)}
                                                    className={p.status === 'live' ? 'btn-primary text-xs py-2 px-3' : 'btn-ghost text-xs py-2 px-3'}
                                                >
                                                    {p.status === 'live' ? t('dashboard.btnEnterLive') : t('dashboard.btnGoLive')}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* History table (Ended) */}
                <div>
                    <h2 className="text-xl font-black text-white mb-4">{t('dashboard.historyTitle')}</h2>
                    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3"
                            style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                            {[t('dashboard.colItem'), t('dashboard.colStatus'), t('dashboard.colFinal'), t('dashboard.colActions')].map((h, i) => (
                                <span key={h} className={`text-xs font-semibold text-gray-500 uppercase tracking-wider ${i === 3 ? 'col-span-2 text-right' : i === 0 ? 'col-span-5' : 'col-span-2'}`}>{h}</span>
                            ))}
                        </div>

                        {loading && (
                            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                                <SkeletonRow />
                            </div>
                        )}

                        {!loading && endedPujas.length === 0 && (
                            <div className="p-10 text-center">
                                <p className="text-gray-400 font-semibold mb-2">{t('dashboard.noEnded')}</p>
                            </div>
                        )}

                        {!loading && endedPujas.length > 0 && (
                            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                                {endedPujas.map((p, idx) => {
                                    const col = statusColor(p.status, t);
                                    const price = p.currentPrice ?? p.current_price ?? p.startingPrice ?? p.starting_price ?? 0;
                                    return (
                                        <div key={p.id} className="grid grid-cols-12 gap-4 items-center px-5 py-4 hover:bg-white/[0.02] transition-colors">
                                            <div className="col-span-10 md:col-span-5 flex items-center gap-3 opacity-60">
                                                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0" style={{ background: '#1a1a2e', border: '1px solid var(--border)' }}>
                                                    {p.image_url || p.img ? <img src={p.image_url || p.img} alt={p.title} className="w-full h-full flex items-center justify-center grayscale" onError={e => e.target.style.display = 'none'} /> : <div className="w-full h-full flex items-center justify-center text-gray-700"></div>}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-white font-semibold text-sm truncate line-through">{p.title}</p>
                                                    <p className="text-gray-600 text-xs">#{p.id}</p>
                                                </div>
                                            </div>
                                            <div className="hidden md:flex col-span-2 items-center opacity-70">
                                                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color: col.text, background: col.bg }}>{t('dashboard.badge{col.label}')}</span>
                                            </div>
                                            <div className="hidden md:block col-span-2 opacity-70">
                                                <p className="text-gray-400 font-bold text-sm">${Number(price).toLocaleString()}</p>
                                            </div>
                                            <div className="col-span-2 md:col-span-3 flex justify-end gap-2">
                                                <button disabled className="bg-gray-800 text-gray-500 text-xs py-2 px-3 rounded cursor-not-allowed">
                                                    {t('dashboard.btnClosed')}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
