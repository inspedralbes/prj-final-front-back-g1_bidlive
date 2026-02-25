import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import ChatSidebar from '../components/auction/ChatSidebar';
import BiddingHUD from '../components/auction/BiddingHUD';
import VideoPlayer from '../components/auction/VideoPlayer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function LiveAuctionVideo() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const username = user?.username || user?.email || 'Anonymous';

    // ── 1. Access-check state (null = still verifying) ─────────────────────
    const [auctionStatus, setAuctionStatus] = useState(null);

    // ── 2. WS hook — pass null while verifying to avoid premature connection ─
    const wsHook = useWebSocket(auctionStatus !== null ? id : null, username, 'viewer');
    const { status, messages, viewerCount, sendMessage, placeBid, auctionEnded } = wsHook;

    // ── 3. UI state ────────────────────────────────────────────────────────
    const [showEndedPopup, setShowEndedPopup] = useState(false);
    const [countdown, setCountdown] = useState(5);

    // ── 4. Fetch auction status on mount (redirect if ended) ───────────────
    useEffect(() => {
        fetch(`${API_URL}/auction/pujas/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
            .then(r => r.json())
            .then(data => {
                if (data?.status === 'ended') {
                    navigate('/', { replace: true });
                } else {
                    setAuctionStatus(data?.status ?? 'upcoming');
                }
            })
            .catch(() => setAuctionStatus('upcoming'));
    }, [id, navigate]);

    // ── 5. Auction-ended popup + countdown ────────────────────────────────
    useEffect(() => {
        if (!auctionEnded) return;
        setShowEndedPopup(true);
        let remaining = 5;
        setCountdown(remaining);
        const interval = setInterval(() => {
            remaining -= 1;
            setCountdown(remaining);
            if (remaining <= 0) { clearInterval(interval); navigate('/'); }
        }, 1000);
        return () => clearInterval(interval);
    }, [auctionEnded, navigate]);

    // Current bid from BID_PLACED messages
    const latestBid = messages
        .filter(m => m.type === 'BID_PLACED')
        .reduce((acc, m) => Math.max(acc, Number(m.payload?.amount) || 0), 0);

    // ── Loading screen — placed AFTER all hooks ────────────────────────────
    if (auctionStatus === null) {
        return (
            <div className="h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
                <div className="text-gray-500 text-sm">Loading auction...</div>
            </div>
        );
    }

    return (
        <div
            className="h-screen flex flex-col overflow-hidden relative"
            style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
        >
            {/* ── Auction Ended Popup ──────────────────────────────────────── */}
            {showEndedPopup && (
                <div className="absolute inset-0 z-50 flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}>
                    <div
                        className="flex flex-col items-center gap-6 rounded-3xl p-10 text-center max-w-sm w-full mx-4"
                        style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                        }}
                    >
                        {/* Icon */}
                        <div className="w-16 h-16 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(239,68,68,0.12)', border: '1.5px solid rgba(239,68,68,0.25)' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round">
                                <path d="M18.36 6.64A9 9 0 1 1 5.64 19.36" />
                                <line x1="18.36" y1="18.36" x2="5.64" y2="5.64" />
                            </svg>
                        </div>

                        {/* Text */}
                        <div>
                            <h2 className="text-white font-black text-2xl mb-2">Live Finalizado</h2>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                El vendedor ha terminado la transmisión en directo.<br />
                                Gracias por participar.
                            </p>
                        </div>

                        {/* Countdown */}
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-4xl font-black text-amber-400">{countdown}</span>
                            <span className="text-gray-500 text-xs">Redirigiendo a inicio...</span>
                        </div>

                        {/* Manual redirect */}
                        <button
                            onClick={() => navigate('/')}
                            className="btn-primary w-full py-3"
                        >
                            Ir a inicio ahora
                        </button>
                    </div>
                </div>
            )}

            {/* ── Top bar ─────────────────────────────────────────────────── */}
            <header className="shrink-0 h-14 flex items-center justify-between px-5"
                style={{ background: 'rgba(8,8,15,0.9)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(16px)' }}>
                <Link to="/" className="flex items-center gap-2 text-white font-bold text-base">
                    <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" fill="#08080f" />
                        </svg>
                    </div>
                    Bid<span className="text-amber-400">Live</span>
                </Link>
                <div className="text-gray-500 text-sm font-medium truncate hidden sm:block max-w-xs">
                    Auction #{id}
                </div>
                <Link to="/explore" className="btn-ghost text-xs py-1.5 px-3">← Browse</Link>
            </header>

            {/* ── Main layout ─────────────────────────────────────────────── */}
            <main className="flex-1 grid overflow-hidden" style={{ gridTemplateColumns: '1fr 360px' }}>
                {/* Left: video + bidding */}
                <div className="flex flex-col overflow-y-auto scroll-area p-5 gap-5">
                    <VideoPlayer auctionId={id} role="viewer" viewerCount={viewerCount} externalWs={wsHook} />
                    <BiddingHUD
                        currentBid={latestBid}
                        placeBid={placeBid}
                        disabled={status !== 'connected' || auctionEnded}
                    />
                    <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="badge-live"><span className="live-dot" /> Auction #{id}</span>
                        </div>
                        <p className="text-gray-500 text-sm">
                            Place your bid above to participate. All bids appear in the live chat in real-time.
                        </p>
                    </div>
                </div>

                {/* Right: chat */}
                <ChatSidebar
                    auctionId={id}
                    role="viewer"
                    externalMessages={messages}
                    externalSend={sendMessage}
                    externalStatus={status}
                />
            </main>
        </div>
    );
}
