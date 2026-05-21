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
    const latestBidMsg = messages
        .filter(m => m.type === 'BID_PLACED')
        .slice(-1)[0]; // Get the very last one

    const latestBid = Number(latestBidMsg?.payload?.amount) || Number(auctionData?.current_price) || Number(auctionData?.starting_price) || 0;

    // Logic to update winning status and trigger toast
    useEffect(() => {
        if (!latestBidMsg) return;

        const bidder = latestBidMsg.payload.username;
        const wasWinning = isWinning;
        const nowWinning = bidder === username;

        setIsWinning(nowWinning);

        if (wasWinning && !nowWinning) {
            setToast({ message: '¡Has sido superado!', type: 'warning' });
        }
    }, [latestBidMsg, username]);

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
            className="h-screen flex flex-col overflow-hidden relative"
            style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
        >
            {/* ── Auction Ended Popup ──────────────────────────────────────── */}
            {showEndedPopup && (
                <div className="absolute inset-0 z-50 flex items-center justify-center font-inter"
                    style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}>
                    <div
                        className="flex flex-col items-center gap-6 rounded-3xl p-10 text-center max-w-sm w-full mx-4 animate-scale-in"
                        style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                        }}
                    >
                        {isFinalWinner ? (
                            <>
                                {/* Winner Icon */}
                                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-2"
                                    style={{ background: 'rgba(245,158,11,0.15)', border: '2px solid rgba(245,158,11,0.4)', boxShadow: '0 0 20px rgba(245,158,11,0.2)' }}>
                                    <span className="material-symbols-outlined text-amber-400" style={{ fontSize: '40px', fontVariationSettings: "'FILL' 1" }}>trophy</span>
                                </div>
                                <div>
                                    <h2 className="text-white font-black text-3xl mb-1">¡HAS GANADO!</h2>
                                    <p className="text-amber-400 font-bold text-lg mb-4">{endData?.finalPrice}€</p>
                                </div>
                                
                                {!paymentMethod ? (
                                    <div className="flex flex-col gap-3 w-full">
                                        <p className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-1">Selecciona método de pago</p>
                                        <button 
                                            onClick={() => setPaymentMethod('wallet')}
                                            className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all w-full group text-left"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-all">
                                                <span className="material-symbols-outlined">account_balance_wallet</span>
                                            </div>
                                            <div>
                                                <p className="text-white font-bold text-sm">Mi Billetera</p>
                                                <p className="text-gray-500 text-[10px]">Pagar con saldo interno</p>
                                            </div>
                                        </button>
                                        <button 
                                            onClick={() => handlePayment('stripe')}
                                            className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all w-full group text-left"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                                <span className="material-symbols-outlined">credit_card</span>
                                            </div>
                                            <div>
                                                <p className="text-white font-bold text-sm">Tarjeta bancaria</p>
                                                <p className="text-gray-500 text-[10px]">Pago seguro vía Stripe</p>
                                            </div>
                                        </button>
                                        <button onClick={() => navigate('/profile')} className="btn-ghost py-3 w-full text-xs mt-2">
                                            Pagar más tarde
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4 w-full animate-fade-in">
                                        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-center">
                                            <p className="text-gray-400 text-xs mb-1">Confirmar pago desde</p>
                                            <p className="text-white font-bold">Mi Billetera</p>
                                        </div>
                                        <button 
                                            onClick={() => handlePayment('wallet')}
                                            disabled={paying}
                                            className="btn-primary py-3.5 w-full flex items-center justify-center gap-2"
                                        >
                                            {paying ? <div className="loading-spinner w-4 h-4 border-2" /> : (
                                                <>
                                                    <span className="material-symbols-outlined text-sm">payments</span>
                                                    Confirmar Pago
                                                </>
                                            )}
                                        </button>
                                        <button onClick={() => setPaymentMethod(null)} disabled={paying} className="text-gray-500 text-xs font-bold hover:text-white transition-colors">
                                            Cambiar método
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : !hasWinner ? (
                            <div className="text-center p-8">
                                <div className="w-20 h-20 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="material-symbols-outlined text-gray-400 text-4xl">timer_off</span>
                                </div>
                                <h2 className="text-white font-black text-2xl mb-2 text-red-400">Subasta Desierta</h2>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                    El tiempo ha finalizado sin recibir ninguna puja.<br />
                                    La subasta se ha cerrado sin ganador.
                                </p>
                                <button onClick={() => navigate('/')} className="btn-ghost w-full py-3">
                                    Volver al inicio
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Ended Icon */}
                                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                                    style={{ background: 'rgba(259,68,68,0.12)', border: '1.5px solid rgba(239,68,68,0.25)' }}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round">
                                        <path d="M18.36 6.64A9 9 0 1 1 5.64 19.36" />
                                        <line x1="18.36" y1="18.36" x2="5.64" y2="5.64" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-white font-black text-2xl mb-2">Live Finalizado</h2>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        El vendedor ha terminado la transmisión en directo.<br />
                                        Gracias por participar.
                                    </p>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-4xl font-black text-amber-400">{countdown}</span>
                                    <span className="text-gray-500 text-xs">Redirigiendo a inicio...</span>
                                </div>
                                <button onClick={() => navigate('/')} className="btn-primary w-full py-3">
                                    Ir a inicio ahora
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
            <main className="flex-1 flex flex-col md:grid overflow-hidden md:grid-cols-[1fr_380px]">
                {/* Left: video fills the column */}
                <div className="flex items-center justify-center overflow-hidden min-h-[300px] md:min-h-0" style={{ background: '#000' }}>
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

                {/* Right: bidding + chat stacked */}
                <div className="flex flex-col h-full overflow-hidden" style={{ borderLeft: '1px solid var(--border)' }}>
                    {/* Bidding HUD — always visible, never pushed out */}
                    <div className="shrink-0 p-4 overflow-y-auto scroll-area" style={{ borderBottom: '1px solid var(--border)', maxHeight: '45%' }}>
                        <BiddingHUD
                            currentBid={latestBid}
                            hasBids={!!latestBidMsg || (auctionData?.last_bidder_id !== null)}
                            placeBid={placeBid}
                            disabled={status !== 'connected' || auctionEnded}
                            status={latestBid > 0 ? (isWinning ? 'winning' : 'outbid') : 'none'}
                            balance={balance}
                            endTime={endTime}
                            serverTimeOffset={wsHook.serverTimeOffset}
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
