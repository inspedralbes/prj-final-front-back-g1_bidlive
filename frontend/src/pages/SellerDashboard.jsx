import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePujasByUser } from '../hooks/usePujas';
import Header from '../components/layout/Header';

const statusColor = (status) => {
    if (status === 'live') return { text: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Live' };
    if (status === 'active') return { text: '#22c55e', bg: 'rgba(34,197,94,0.1)', label: 'Active' };
    return { text: '#9ca3af', bg: 'rgba(156,163,175,0.1)', label: status || 'Inactive' };
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
    const { data: pujas, loading } = usePujasByUser(user?.id);

    const total = pujas.length;
    const live = pujas.filter(p => p.status === 'live').length;
    const prices = pujas.map(p => parseFloat(String(p.current_price || p.startingPrice || 0)));
    const revenue = prices.reduce((a, b) => a + b, 0);

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
            <Header />
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Title */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white">Dashboard</h1>
                        <p className="text-gray-500 mt-1">
                            Welcome back, <span className="text-amber-400 font-semibold">{user?.username || user?.email}</span>
                        </p>
                    </div>
                    <Link to="/create-puja" className="btn-primary gap-2">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                        New auction
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                    <StatCard label="Total auctions" value={total} accent icon={
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>
                    } />
                    <StatCard label="Live now" value={live} icon={
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8"><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>
                    } />
                    <StatCard label="Total value" value={`$${revenue.toLocaleString()}`} icon={
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                    } />
                </div>

                {/* Auctions table */}
                <div>
                    <h2 className="text-xl font-black text-white mb-4">Your auctions</h2>
                    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        {/* Header row */}
                        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3"
                            style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                            {['Item', 'Status', 'Starting price', 'Actions'].map((h, i) => (
                                <span key={h} className={`text-xs font-semibold text-gray-500 uppercase tracking-wider ${i === 3 ? 'col-span-2 text-right' : i === 0 ? 'col-span-5' : 'col-span-2'}`}>{h}</span>
                            ))}
                        </div>

                        {loading && (
                            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                                {[0, 1, 2].map(i => <SkeletonRow key={i} />)}
                            </div>
                        )}

                        {!loading && pujas.length === 0 && (
                            <div className="p-16 text-center">
                                <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(245,158,11,0.6)" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 12h8M12 8v8" /></svg>
                                </div>
                                <p className="text-gray-400 font-semibold text-lg">No auctions yet</p>
                                <p className="text-gray-600 text-sm mt-1 mb-6">Create your first auction to start selling</p>
                                <Link to="/create-puja" className="btn-primary text-sm px-6 py-2.5">
                                    Create first auction
                                </Link>
                            </div>
                        )}

                        {!loading && pujas.length > 0 && (
                            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                                {pujas.map((p, idx) => {
                                    const col = statusColor(p.status);
                                    const price = p.current_price || p.startingPrice || p.starting_price || 0;
                                    return (
                                        <div key={p.id} className="grid grid-cols-12 gap-4 items-center px-5 py-4 hover:bg-white/[0.02] transition-colors animate-fade-in"
                                            style={{ animationDelay: `${idx * 40}ms` }}>
                                            {/* Item */}
                                            <div className="col-span-10 md:col-span-5 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0"
                                                    style={{ background: '#1a1a2e', border: '1px solid var(--border)' }}>
                                                    {p.image_url || p.img
                                                        ? <img src={p.image_url || p.img} alt={p.title} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                                                        : <div className="w-full h-full flex items-center justify-center text-gray-700">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                                                        </div>
                                                    }
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-white font-semibold text-sm truncate">{p.title}</p>
                                                    <p className="text-gray-600 text-xs">#{p.id}</p>
                                                </div>
                                            </div>
                                            {/* Status */}
                                            <div className="hidden md:flex col-span-2 items-center">
                                                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color: col.text, background: col.bg }}>
                                                    {col.label}
                                                </span>
                                            </div>
                                            {/* Price */}
                                            <div className="hidden md:block col-span-2">
                                                <p className="text-amber-400 font-bold text-sm">${Number(price).toLocaleString()}</p>
                                            </div>
                                            {/* Actions */}
                                            <div className="col-span-2 md:col-span-3 flex justify-end gap-2">
                                                {p.status === 'live' ? (
                                                    <button
                                                        onClick={() => navigate(`/seller/live/video/${p.id}`)}
                                                        className="btn-primary text-xs py-2 px-3"
                                                    >
                                                        Go live
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => navigate(`/seller/live/video/${p.id}`)}
                                                        className="btn-ghost text-xs py-2 px-3"
                                                    >
                                                        Start
                                                    </button>
                                                )}
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
