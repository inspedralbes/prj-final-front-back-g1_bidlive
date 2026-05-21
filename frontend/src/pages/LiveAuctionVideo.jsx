import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import ChatSidebar from '../components/auction/ChatSidebar';
import BiddingHUD from '../components/auction/BiddingHUD';
import VideoPlayer from '../components/auction/VideoPlayer';
import NotificationToast from '../components/common/NotificationToast';
import PaymentSuccessOverlay from '../components/common/PaymentSuccessOverlay';
import AuctionTimer from '../components/auction/AuctionTimer';
import FollowButton from '../components/common/FollowButton';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function LiveAuctionVideo() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const username = user?.username || user?.email || 'Anonymous';

    // ── 1. Access-check state (null = still verifying) ─────────────────────
    const [auctionData, setAuctionData] = useState(null);
    const [auctionStatus, setAuctionStatus] = useState(null);

    // ── 2. WS hook — pass null while verifying to avoid premature connection ─
    const wsHook = useWebSocket(auctionStatus !== null ? id : null, username, 'viewer', user?.id);
    const { status, messages, viewerCount, sendMessage, placeBid, auctionEnded, endData } = wsHook;

    // ── 3. UI state ────────────────────────────────────────────────────────
    const [showEndedPopup, setShowEndedPopup] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [toast, setToast] = useState(null);
    const [isWinning, setIsWinning] = useState(false);
    const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
    const [balance, setBalance] = useState(0);
    const [endTime, setEndTime] = useState(null);
    const [sellerInfo, setSellerInfo] = useState({ id: null, username: '' });
    const [redirectCountdown, setRedirectCountdown] = useState(null);

    // ── 4. Fetch auction status on mount (redirect if ended) ───────────────
    useEffect(() => {
        fetch(`${API_URL}/auction/pujas/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
            .then(r => r.json())
            .then(data => {
                setAuctionData(data);
                if (data?.status === 'ended') {
                    navigate('/', { replace: true });
                } else {
                    setAuctionStatus(data?.status ?? 'upcoming');
                    setEndTime(data?.end_time);
                    setSellerInfo({ id: data?.seller_id, username: data?.seller_username });

                    // ── FIX: Initialize isWinning from DB last_bidder_id so reconnecting
                    // leader gets the correct badge without waiting for WS messages.
                    if (data?.last_bidder_id && user?.id) {
                        setIsWinning(Number(data.last_bidder_id) === Number(user.id));
                    }
                    
                    // Check balance warning
                    fetch(`${API_URL}/auth/wallet/balance`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    })
                        .then(r => r.json())
                        .then(wallet => {
                            setBalance(wallet.balance || 0);
                            const currentP = Number(data.current_price) || Number(data.starting_price);
                            if ((wallet.balance || 0) < currentP) {
                                setToast({ 
                                    message: `Aviso: Tu saldo (${wallet.balance || 0}€) es inferior a la puja mínima (${currentP}€). Recarga para participar.`, 
                                    type: 'warning' 
                                });
                            }
                        });
                }
            })
            .catch(() => setAuctionStatus('upcoming'));

        // Fetch balance
        fetch(`${API_URL}/auth/wallet/balance`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
            .then(r => r.json())
            .then(data => setBalance(data.balance || 0))
            .catch(err => console.error('Error fetching balance:', err));
    }, [id, navigate, user?.id]);

    // ── 5. Auction-ended popup + auto-redirect ────────────────────────────────────
    useEffect(() => {
        if (!auctionEnded) return;
        setShowEndedPopup(true);
    }, [auctionEnded]);

    // Current bid from BID_PLACED messages
    const latestBidMsg = messages
        .filter(m => m.type === 'BID_PLACED')
        .slice(-1)[0]; // Get the very last one

    const latestBid = Number(latestBidMsg?.payload?.amount) || Number(auctionData?.current_price) || Number(auctionData?.starting_price) || 0;

    // Logic to update winning status and trigger toast
    // Guard: only runs when there's a real new live bid message (not on mount)
    useEffect(() => {
        // latestBidMsg is undefined on mount or after reconnect with empty messages
        if (!latestBidMsg) return;
        // Skip historical messages (they come in on JOIN_ROOM replay)
        if (latestBidMsg.payload?.historical) return;

        const bidder = latestBidMsg.payload.username;
        const wasWinning = isWinning;
        const nowWinning = bidder === username;

        setIsWinning(nowWinning);

        // Only show "superado" toast if a REAL new bid just outbid us
        if (wasWinning && !nowWinning) {
            setToast({ message: '¡Has sido superado!', type: 'warning' });
        }
    }, [latestBidMsg]);

    // Update endTime if NEW_END_TIME received
    useEffect(() => {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg?.type === 'NEW_END_TIME') {
            setEndTime(lastMsg.payload.endTime);
        }
        if (lastMsg?.type === 'ERROR') {
            setToast({ message: lastMsg.payload.message, type: 'error' });
        }
    }, [messages]);

    const [paymentMethod, setPaymentMethod] = useState(null); // 'wallet' or 'stripe'
    const [paying, setPaying] = useState(false);
    const isFinalWinner = endData?.winnerId === user?.id;
    const hasWinner = !!endData?.winnerId;

    // Auto-redirect countdown for non-winners
    useEffect(() => {
        // Only start countdown once the ended popup shows and we know we didn't win
        if (!showEndedPopup) return;
        if (isFinalWinner) return; // winners choose manually
        setRedirectCountdown(8);
    }, [showEndedPopup, isFinalWinner]);

    useEffect(() => {
        if (redirectCountdown === null) return;
        if (redirectCountdown <= 0) {
            navigate('/explore');
            return;
        }
        const t = setTimeout(() => setRedirectCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [redirectCountdown, navigate]);

    // ── Client-side fallback for viewer: if timer expired but WS AUCTION_ENDED missed ──
    // Fetches real winner from REST so popup always shows correct data.
    const viewerFallbackFiredRef = React.useRef(false);
    useEffect(() => {
        if (!endTime || auctionEnded || viewerFallbackFiredRef.current) return;
        const check = setInterval(() => {
            const now = Date.now();
            const serverNow = now - (wsHook.serverTimeOffset || 0);
            if (serverNow >= new Date(endTime).getTime() + 6000) {
                clearInterval(check);
                if (viewerFallbackFiredRef.current) return;
                viewerFallbackFiredRef.current = true;
                console.log('[Viewer] Fallback: endTime expired, fetching winner from REST...');
                // Fetch real auction state so we show the correct winner (not "Subasta Desierta")
                fetch(`${API_URL}/auction/pujas/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                })
                    .then(r => r.json())
                    .then(data => {
                        const fallbackWinnerId = data?.winner_id || data?.last_bidder_id || null;
                        const fallbackWinnerUsername = data?.winner_username || null;
                        const fallbackPrice = data?.current_price || data?.starting_price || 0;
                        console.log(`[Viewer] Fallback winner: ${fallbackWinnerId} (${fallbackWinnerUsername}), price: ${fallbackPrice}`);
                        if (fallbackWinnerId) {
                            setEndData({ winnerId: fallbackWinnerId, winnerUsername: fallbackWinnerUsername, finalPrice: fallbackPrice });
                        }
                        setShowEndedPopup(true);
                    })
                    .catch(() => {
                        // If fetch fails, still show popup (may show desierta)
                        setShowEndedPopup(true);
                    });
            }
        }, 1000);
        return () => clearInterval(check);
    }, [endTime, auctionEnded, wsHook.serverTimeOffset, id]);

    // ── Loading screen — placed AFTER all hooks ────────────────────────────
    if (auctionStatus === null) {
        return (
            <div className="h-screen flex items-center justify-center font-inter" style={{ background: 'var(--bg-base)' }}>
                <div className="flex flex-col items-center gap-4">
                    <div className="loading-spinner w-8 h-8 border-3 border-amber-500/30 border-t-amber-500" />
                    <div className="text-gray-500 text-xs font-bold tracking-widest uppercase animate-pulse">Cargando subasta...</div>
                </div>
            </div>
        );
    }

    const handlePayment = async (method) => {
        setPaying(true);
        try {
            const resp = await fetch(`${API_URL}/auction/pujas/${id}/pay`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}` 
                },
                body: JSON.stringify({ method })
            });
            const data = await resp.json();
            
            if (resp.ok) {
                if (method === 'stripe' && data.url) {
                    window.location.href = data.url;
                } else {
                    setShowSuccessOverlay(true);
                }
            } else {
                setToast({ message: data.message || 'Error al procesar el pago', type: 'error' });
            }
        } catch (err) {
            console.error('Payment error:', err);
            setToast({ message: 'Error de conexión al procesar el pago', type: 'error' });
        } finally {
            setPaying(false);
        }
    };

    return (
        <div
            className="h-screen flex flex-col overflow-hidden overflow-x-hidden relative"
            style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
        >
            {/* ── Auction Ended Popup ──────────────────────────────────────── */}
            {showEndedPopup && (
                <div className="absolute inset-0 z-50 flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)' }}>

                    {/* Ambient glow */}
                    {endData?.winnerId && (
                        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
                    )}

                    <div className="flex flex-col items-center gap-5 rounded-3xl p-6 sm:p-10 text-center max-w-md w-full mx-4 relative max-h-[90vh] overflow-y-auto"
                        style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(245,158,11,0.25)',
                            boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 60px rgba(245,158,11,0.08)',
                            backdropFilter: 'blur(24px)',
                        }}
                    >
                        {endData?.winnerId ? (
                            <>
                                {/* Trophy */}
                                <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'rgba(245,158,11,0.12)', border: '2px solid rgba(245,158,11,0.4)', boxShadow: '0 0 40px rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
                                    🏆
                                </div>

                                {/* Title */}
                                <div>
                                    <p className="text-amber-400 font-bold text-sm uppercase tracking-widest mb-2">Subasta Finalizada</p>
                                    <h2 className="text-white font-black text-4xl mb-1" style={{ letterSpacing: '-0.5px' }}>
                                        {isFinalWinner ? '¡Has Ganado!' : '¡Tenemos Ganador!'}
                                    </h2>
                                    {/* Winner name — shown to everyone */}
                                    <div className="mt-4 px-6 py-3 rounded-2xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Ganador</p>
                                        <p className="text-amber-400 font-black text-2xl">{endData?.winnerUsername || 'Usuario'}</p>
                                        <p className="text-white font-bold text-lg mt-1">{endData?.finalPrice}€</p>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex flex-col gap-3 w-full">
                                    {isFinalWinner && (
                                        <button
                                            onClick={() => {
                                                // Navigate to chat with seller
                                                const token = localStorage.getItem('token');
                                                fetch(`${API_URL}/chat/conversations`, {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                                    body: JSON.stringify({ participantId: auctionData?.seller_id })
                                                }).then(r => r.json()).then(data => {
                                                    navigate(`/messages/${data.id}`);
                                                }).catch(() => navigate('/messages'));
                                            }}
                                            className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2"
                                            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#08080f', boxShadow: '0 8px 24px rgba(245,158,11,0.3)' }}
                                        >
                                            <span className="material-symbols-outlined">forum</span>
                                            Contactar con vendedor
                                        </button>
                                    )}
                                    <button
                                        onClick={() => navigate('/explore')}
                                        className="w-full py-3.5 rounded-2xl font-bold text-sm"
                                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff' }}
                                    >
                                        {isFinalWinner
                                            ? 'Volver a las salas'
                                            : redirectCountdown !== null && redirectCountdown > 0
                                                ? `Volviendo a las salas en ${redirectCountdown}s...`
                                                : 'Volver a las salas'
                                        }
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* No winner */}
                                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(107,114,128,0.15)', border: '1.5px solid rgba(107,114,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>
                                    ⏱
                                </div>
                                <div>
                                    <h2 className="text-white font-black text-3xl mb-2">Subasta Desierta</h2>
                                    <p className="text-gray-400 text-sm leading-relaxed">El tiempo ha finalizado sin recibir ninguna puja.</p>
                                </div>
                                <button onClick={() => navigate('/explore')} className="w-full py-3.5 rounded-2xl font-bold text-sm"
                                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff' }}>
                                    {redirectCountdown !== null && redirectCountdown > 0
                                        ? `Volviendo a las salas en ${redirectCountdown}s...`
                                        : 'Volver a las salas'
                                    }
                                </button>
                            </>
                        )}
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
                <div className="flex items-center gap-4">
                    <div className="text-gray-500 text-sm font-medium truncate hidden sm:block max-w-xs">
                        Auction #{id}
                    </div>
                    {sellerInfo.id && (
                        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Seller:</span>
                            <span className="text-sm font-bold text-white">{sellerInfo.username || '...'}</span>
                            <FollowButton sellerId={sellerInfo.id} />
                        </div>
                    )}
                </div>
                <Link to="/explore" className="btn-ghost text-xs py-1.5 px-3">← Browse</Link>
            </header>

            {/* ── Main layout ─────────────────────────────────────────────── */}
            <main className="flex-1 flex flex-col overflow-hidden md:grid md:grid-cols-[1fr_380px]">
                {/* Left: video fills the column */}
                <div className="w-full aspect-video md:aspect-auto md:h-full flex items-center justify-center overflow-hidden" style={{ background: '#000', flexShrink: 0 }}>
                    <VideoPlayer 
                        auctionId={id} 
                        role="viewer" 
                        viewerCount={viewerCount} 
                        externalWs={wsHook} 
                        categoryIcon={auctionData?.category_icon}
                        categoryName={auctionData?.category_name}
                        mode={auctionData?.mode}
                        imageUrl={auctionData?.stream_image_url || auctionData?.image_url}
                        auctionTitle={auctionData?.title}
                        auctionDescription={auctionData?.description}
                    />
                </div>

                {/* Right: bidding + chat stacked — scrollable on mobile */}
                <div className="flex flex-col flex-1 overflow-hidden md:max-h-none md:h-full" style={{ borderTop: '1px solid var(--border)', borderLeft: 'none' }}>
                    {/* Bidding HUD — always visible, never pushed out */}
                    <div className="shrink-0 p-3 sm:p-4 overflow-y-auto scroll-area max-h-[30vh] md:max-h-[50%]" style={{ borderBottom: '1px solid var(--border)' }}>
                        <BiddingHUD
                            currentBid={latestBid}
                            hasBids={!!latestBidMsg || (auctionData?.last_bidder_id !== null)}
                            placeBid={placeBid}
                            disabled={status !== 'connected' || auctionEnded}
                            status={latestBid > 0 ? (isWinning ? 'winning' : 'outbid') : 'none'}
                            balance={balance}
                            endTime={endTime}
                            serverTimeOffset={wsHook.serverTimeOffset}
                            serverSecondsLeft={wsHook.serverSecondsLeft}
                        />
                    </div>

                    {/* Chat — fills remaining space with internal scroll */}
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <ChatSidebar
                            auctionId={id}
                            role="viewer"
                            externalMessages={messages}
                            externalSend={sendMessage}
                            externalStatus={status}
                        />
                    </div>
                </div>
            </main>

            {/* ── Toast Notifications ────────────────────────────────────── */}
            {toast && (
                <NotificationToast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}
            {/* Success Animation Overlay */}
            {showSuccessOverlay && (
                <PaymentSuccessOverlay onComplete={() => navigate('/profile')} />
            )}
        </div>
    );
}
