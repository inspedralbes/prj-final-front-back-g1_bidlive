import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import ChatSidebar from '../components/auction/ChatSidebar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

// ── Seller camera/photo preview component ────────────────────────────────────────
function SellerVideo({ localRef, status, viewerCount, onGoLive, isStreaming, mode, imageUrl, auctionTitle, auctionDescription }) {
  const containerRef = useRef(null);
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hideTimer = useRef(null);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 2500);
  };

  const handleMouseLeave = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setShowControls(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err =>
        console.warn('[SellerVideo] Fullscreen error:', err)
      );
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden"
      style={{
        background: '#000',
        border: '1px solid rgba(255,255,255,0.07)',
        height: isFullscreen ? '100vh' : '100%',
        width: '100%',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Photo-only mode display */}
      {mode === 'photo' ? (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0a0a18 0%, #08080f 100%)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '20px', padding: '28px', maxWidth: '340px', width: '85%', textAlign: 'center', position: 'relative', boxShadow: '0 0 40px rgba(245,158,11,0.1)' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#08080f', fontWeight: '900', fontSize: '9px', letterSpacing: '0.18em', padding: '3px 12px', borderRadius: '999px', whiteSpace: 'nowrap', animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }}>
              ■ MODO FOTO
            </div>
            {imageUrl ? (
              <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', border: '1px solid rgba(245,158,11,0.15)', background: '#000' }}>
                <img src={imageUrl} alt={auctionTitle || 'Product'} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            ) : null}
            {auctionTitle && <h3 style={{ color: '#fff', fontWeight: '900', fontSize: '16px', margin: '0 0 6px' }}>{auctionTitle}</h3>}
            {auctionDescription && <p style={{ color: '#9ca3af', fontSize: '12px', margin: '0', lineHeight: 1.5 }}>{auctionDescription}</p>}
          </div>
        </div>
      ) : (
        <video
          ref={localRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full block"
          style={{ background: '#000', objectFit: 'cover' }}
        />
      )}

      {/* BROADCASTING / Camera preview badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        {isStreaming
          ? <span className="badge-live"><span className="live-dot" /> BROADCASTING</span>
          : <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(0,0,0,0.7)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }}>Camera preview</span>
        }
      </div>

      {/* Viewer count top-right (hides when bar is shown) */}
      {isStreaming && (
        <div
          className="absolute top-3 right-3 z-10 flex items-center gap-1.5 text-xs font-medium text-white px-2.5 py-1.5 rounded-full"
          style={{
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.09)',
            transition: 'opacity 0.2s',
            opacity: showControls ? 0 : 1,
            pointerEvents: 'none',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" opacity="0.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
          {viewerCount} watching
        </div>
      )}

      {/* Bottom control bar (hover reveal) */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 flex items-center gap-3 px-4 py-3"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)',
          transition: 'opacity 0.25s ease',
          opacity: showControls || isFullscreen ? 1 : 0,
          pointerEvents: showControls || isFullscreen ? 'auto' : 'none',
        }}
      >
        {/* Viewer count in bar */}
        {isStreaming && (
          <div className="flex items-center gap-1.5 text-white/70 text-xs font-medium">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
            {viewerCount}
          </div>
        )}
        <div style={{ flex: 1 }} />
        {/* Fullscreen button */}
        <button
          onClick={toggleFullscreen}
          className="text-white/80 hover:text-white transition-colors"
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3v3a2 2 0 0 1-2 2H3" />
              <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
              <path d="M3 16h3a2 2 0 0 1 2 2v3" />
              <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3" />
              <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
              <path d="M3 16v3a2 2 0 0 0 2 2h3" />
              <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
            </svg>
          )}
        </button>
      </div>

      {/* Go Live button */}
      {!isStreaming && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
          <button onClick={onGoLive} disabled={status !== 'connected'} className="btn-primary text-base px-8 py-3.5 gap-2 disabled:opacity-50">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            {status === 'connected' ? 'Go Live' : 'Connecting...'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main seller page ──────────────────────────────────────────────────────────────────────
export default function SellerLiveVideo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const username = user?.username || user?.email || 'Anonymous';

  // One shared WS connection for the seller
  const { status, messages, viewerCount, sendMessage, sendSignal, setSignalHandler, serverTimeOffset, serverSecondsLeft, auctionEnded, endData } =
    useWebSocket(id, username, 'seller', user?.id);

  const localRef = useRef(null);
  const streamRef = useRef(null);
  // Map<viewerSessionId, { pc: RTCPeerConnection, iceQueue: RTCIceCandidateInit[] }>
  const peersRef = useRef(new Map());

  const [isStreaming, setIsStreaming] = React.useState(false);
  const [isEnding, setIsEnding] = React.useState(false);
  const [auctionMode, setAuctionMode] = React.useState('video');
  const [auctionImageUrl, setAuctionImageUrl] = React.useState(null);
  const [auctionStreamImageUrl, setAuctionStreamImageUrl] = React.useState(null);
  const [auctionTitle, setAuctionTitle] = React.useState('');
  const [auctionDescription, setAuctionDescription] = React.useState('');
  const [endTime, setEndTime] = React.useState(null);
  const [timeLeft, setTimeLeft] = React.useState(null);
  const [currentBid, setCurrentBid] = React.useState(0);
  const [currentBidder, setCurrentBidder] = React.useState('');
  const [redirectCountdown, setRedirectCountdown] = React.useState(null);

  // Fetch auction data on mount
  React.useEffect(() => {
    fetch(`${API_URL}/auction/pujas/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(r => r.json())
      .then(data => {
        setAuctionMode(data.mode || 'video');
        setAuctionImageUrl(data.image_url || null);
        setAuctionStreamImageUrl(data.stream_image_url || null);
        setAuctionTitle(data.title || '');
        setAuctionDescription(data.description || '');
        if (data.end_time) setEndTime(new Date(data.end_time));
        setCurrentBid(Number(data.current_price) || Number(data.starting_price) || 0);
      })
      .catch(err => console.error('[Seller] Failed to fetch auction data:', err.message));
  }, [id]);

  // ── Countdown timer (server-authoritative base) ───────────────────────────
  // When serverSecondsLeft arrives via NEW_END_TIME, reset the base.
  // The local interval counts down from that exact integer — same for ALL clients.
  const timerBaseRef = React.useRef({ seconds: null, timestamp: null });

  React.useEffect(() => {
    if (serverSecondsLeft === null || serverSecondsLeft === undefined) return;
    timerBaseRef.current = { seconds: serverSecondsLeft, timestamp: Date.now() };
    setTimeLeft(serverSecondsLeft);
  }, [serverSecondsLeft]);

  React.useEffect(() => {
    // Also keep a fallback using endTime for the very first render before WS sync
    if (!endTime) return;
    const iv = setInterval(() => {
      if (timerBaseRef.current.seconds !== null) {
        const elapsed = Math.floor((Date.now() - timerBaseRef.current.timestamp) / 1000);
        setTimeLeft(Math.max(0, timerBaseRef.current.seconds - elapsed));
      } else {
        const serverNow = Date.now() - serverTimeOffset;
        setTimeLeft(Math.max(0, Math.floor((new Date(endTime).getTime() - serverNow) / 1000)));
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [endTime, serverTimeOffset]);

  // ── Client-side fallback: if timer hits 0 and WS AUCTION_ENDED never arrived ──
  // The closure worker may take up to 5s, or the WS broadcast could be missed.
  // After 4s of timeLeft===0, call the end API ourselves (idempotent) and redirect.
  const fallbackFiredRef = React.useRef(false);
  React.useEffect(() => {
    if (timeLeft !== 0 || auctionEnded || fallbackFiredRef.current) return;
    fallbackFiredRef.current = true;
    console.log('[Seller] Timer hit 0, starting 4s fallback...');
    const t = setTimeout(async () => {
      try {
        console.log('[Seller] Fallback: calling /end API');
        const resp = await fetch(`${API_URL}/auction/pujas/${id}/end`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await resp.json();
        console.log('[Seller] Fallback /end result:', data.status);
      } catch (err) {
        console.error('[Seller] Fallback /end error:', err);
      }
      // Always redirect regardless of API result
      if (redirectCountdown === null) {
        streamRef.current?.getTracks().forEach(t => t.stop());
        peersRef.current.forEach(({ pc }) => pc.close());
        peersRef.current.clear();
        setIsEnding(true);
        setRedirectCountdown(4);
      }
    }, 4000);
    return () => clearTimeout(t);
  }, [timeLeft, auctionEnded]);

  // Update end_time when NEW_END_TIME arrives via WS (join sync + anti-snipe extension)
  React.useEffect(() => {
    const last = [...messages].reverse().find(m => m.type === 'NEW_END_TIME');
    if (last?.payload?.endTime) setEndTime(new Date(last.payload.endTime));
  }, [messages]);

  // ── Create (or reuse) one RTCPeerConnection per viewer ──────────────────
  const createPcForViewer = useCallback((viewerSessionId) => {
    if (peersRef.current.has(viewerSessionId)) {
      return peersRef.current.get(viewerSessionId).pc;
    }
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    // Add all current tracks to this PC
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => pc.addTrack(track, streamRef.current));
    }

    pc.onicecandidate = (e) => {
      if (e.candidate) sendSignal('ICE_CANDIDATE', { candidate: e.candidate, targetId: viewerSessionId });
    };

    pc.onconnectionstatechange = () => {
      if (['failed', 'closed', 'disconnected'].includes(pc.connectionState)) {
        peersRef.current.delete(viewerSessionId);
      }
    };

    peersRef.current.set(viewerSessionId, { pc, iceQueue: [] });
    return pc;
  }, [sendSignal]);

  // ── Send offer to a specific viewer ─────────────────────────────────────
  const sendOfferToViewer = useCallback(async (viewerSessionId) => {
    if (!streamRef.current && auctionMode !== 'photo') {
      console.warn('[Seller] No stream yet — ignoring REQUEST_OFFER from', viewerSessionId);
      return;
    }
    const pc = createPcForViewer(viewerSessionId);
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal('OFFER', { sdp: offer, targetId: viewerSessionId });
      console.log(`[Seller] OFFER → viewer[${viewerSessionId}]`);
    } catch (err) {
      console.error('[Seller] createOffer error:', err);
    }
  }, [createPcForViewer, sendSignal, auctionMode]);

  // ── Register WebRTC signal handler via the hook (no onmessage override) ─
  useEffect(() => {
    if (status !== 'connected') return;

    const handler = async (data) => {
      try {
        if (data.type === 'REQUEST_OFFER') {
          // A viewer joined — create a dedicated PC and send them an offer
          const viewerSessionId = data.payload?.fromId;
          if (!viewerSessionId) return;
          console.log(`[Seller] REQUEST_OFFER from viewer[${viewerSessionId}]`);
          await sendOfferToViewer(viewerSessionId);
        }

        if (data.type === 'ANSWER') {
          const { fromId, sdp } = data.payload;
          const entry = peersRef.current.get(fromId);
          if (!entry) { console.warn('[Seller] ANSWER for unknown viewer:', fromId); return; }
          const { pc, iceQueue } = entry;
          if (pc.signalingState === 'have-local-offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));
            for (const c of iceQueue) await pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => { });
            iceQueue.length = 0;
            console.log(`[Seller] ANSWER processed for viewer[${fromId}]`);
          }
        }

        if (data.type === 'ICE_CANDIDATE') {
          const { fromId, candidate } = data.payload;
          if (!candidate) return;
          const entry = peersRef.current.get(fromId);
          if (!entry) return;
          const { pc, iceQueue } = entry;
          if (pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => { });
          } else {
            iceQueue.push(candidate);
          }
        }
        
        if (data.type === 'AUCTION_ENDED') {
          setIsEnding(true);
          streamRef.current?.getTracks().forEach(t => t.stop());
          peersRef.current.forEach(({ pc }) => pc.close());
          peersRef.current.clear();
          // Auto-redirect seller to dashboard after 4 seconds
          setRedirectCountdown(4);
        }
      } catch (err) {
        console.error('[Seller] signal handler error:', err);
      }
    };

    setSignalHandler(handler);
    return () => setSignalHandler(null);
  }, [status, setSignalHandler, sendOfferToViewer]);

  // ── Go Live: capture camera or activate photo mode ──────────────────────
  const startBroadcast = async () => {
    if (isStreaming || (streamRef.current && auctionMode !== 'photo')) return;
    try {
      if (auctionMode === 'photo') {
        // Photo mode: skip camera, go live directly
        setIsStreaming(true);
        sendSignal('SELLER_LIVE', {});
        console.log('[Seller] SELLER_LIVE sent (photo mode)');
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 } },
          audio: true,
        });
        streamRef.current = stream;
        if (localRef.current) localRef.current.srcObject = stream;
        setIsStreaming(true);
        sendSignal('SELLER_LIVE', {});
        console.log('[Seller] SELLER_LIVE sent');

        // Renegotiate with viewers who joined before we had the camera stream
        peersRef.current.forEach(({ pc }, viewerSessionId) => {
          stream.getTracks().forEach(track => {
            const senders = pc.getSenders();
            const hasTrack = senders.some(s => s.track && s.track.kind === track.kind);
            if (!hasTrack) pc.addTrack(track, stream);
          });
          sendOfferToViewer(viewerSessionId);
        });
      }

      // Update auction status in DB
      fetch(`${API_URL}/auction/pujas/${id}/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then(async (r) => {
          if (r.ok) {
            const data = await r.json();
            if (data.endTime) {
              setEndTime(new Date(data.endTime));
            }
          }
          console.log(`[Seller] start API → ${r.status}`);
        })
        .catch(err => console.error('[Seller] start API error:', err));

    } catch (err) {
      console.error('[Seller] getUserMedia error:', err);
      alert('Camera/microphone access required to go live.');
    }
  };



  // ── Auto-redirect seller when auction ends ──────────────────────────────
  React.useEffect(() => {
    if (redirectCountdown === null) return;
    if (redirectCountdown <= 0) {
      navigate('/seller');
      return;
    }
    const t = setTimeout(() => setRedirectCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [redirectCountdown, navigate]);

  // ── Also watch auctionEnded from hook (if signal handler missed it) ──────
  React.useEffect(() => {
    if (auctionEnded && redirectCountdown === null) {
      streamRef.current?.getTracks().forEach(t => t.stop());
      peersRef.current.forEach(({ pc }) => pc.close());
      peersRef.current.clear();
      setIsEnding(true);
      setRedirectCountdown(4);
    }
  }, [auctionEnded]);

  // ── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      peersRef.current.forEach(({ pc }) => pc.close());
    };
  }, []);

  // Latest bid: merge DB value with live WS messages
  const wsLatestBid = messages
    .filter(m => m.type === 'BID_PLACED')
    .reduce((acc, m) => Math.max(acc, Number(m.payload?.amount) || 0), 0);
  const latestBid = Math.max(currentBid, wsLatestBid);
  const wsLatestBidder = [...messages].reverse().find(m => m.type === 'BID_PLACED')?.payload?.username;
  const latestBidder = wsLatestBidder || currentBidder;

  const formatTime = (secs) => {
    if (secs === null) return '--:--';
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };
  const timerUrgent = timeLeft !== null && timeLeft <= 60;

  return (
    <div className="h-screen flex flex-col overflow-hidden overflow-x-hidden" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      {/* Top bar */}
      <header className="shrink-0 h-14 flex items-center justify-between px-5 gap-4"
        style={{ background: 'rgba(8,8,15,0.9)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(16px)' }}>
        <div className="flex items-center gap-2 text-white font-bold">
          <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7v10l10 5 10-5V7L12 2z" fill="#08080f" /></svg>
          </div>
          Seller Dashboard — Auction #{id}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/seller')} className="btn-ghost text-xs py-1.5 px-3">
            Dashboard
          </button>
        </div>
      </header>

      {/* ── Auction Ended Popup ──────────────────────────────────────── */}
      {auctionEnded && (
        <div className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)' }}>
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
                <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'rgba(245,158,11,0.12)', border: '2px solid rgba(245,158,11,0.4)', boxShadow: '0 0 40px rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
                  🏆
                </div>
                <div>
                  <p className="text-amber-400 font-bold text-sm uppercase tracking-widest mb-2">Subasta Finalizada</p>
                  <h2 className="text-white font-black text-4xl mb-1" style={{ letterSpacing: '-0.5px' }}>
                    ¡Tenemos Ganador!
                  </h2>
                  <div className="mt-4 px-6 py-3 rounded-2xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Ganador</p>
                    <p className="text-amber-400 font-black text-2xl">{endData?.winnerUsername || 'Usuario'}</p>
                    <p className="text-white font-bold text-lg mt-1">{endData?.finalPrice}€</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(107,114,128,0.15)', border: '1.5px solid rgba(107,114,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>
                  ⏱
                </div>
                <div>
                  <h2 className="text-white font-black text-3xl mb-2">Subasta Desierta</h2>
                  <p className="text-gray-400 text-sm leading-relaxed">El tiempo ha finalizado sin recibir ninguna puja.</p>
                </div>
              </>
            )}

            <button onClick={() => navigate('/seller')} className="w-full py-3.5 rounded-2xl font-bold text-sm mt-2"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff' }}>
              {redirectCountdown !== null && redirectCountdown > 0
                ? `Volviendo al Dashboard en ${redirectCountdown}s...`
                : 'Volver al Dashboard'
              }
            </button>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden md:grid md:grid-cols-[1fr_380px]">
        {/* Left: video fills the column */}
        <div className="w-full aspect-video md:aspect-auto md:h-full flex items-center justify-center overflow-hidden" style={{ background: '#000', flexShrink: 0 }}>
          <SellerVideo
            localRef={localRef}
            status={status}
            viewerCount={viewerCount}
            onGoLive={startBroadcast}
            isStreaming={isStreaming}
            mode={auctionMode}
            imageUrl={auctionStreamImageUrl || auctionImageUrl}
            auctionTitle={auctionTitle}
            auctionDescription={auctionDescription}
          />
        </div>

        {/* Right: info panel + chat stacked */}
        <div className="flex flex-col h-full overflow-hidden" style={{ borderLeft: '1px solid var(--border)' }}>
          {/* Stats panel */}
          <div className="shrink-0 p-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-1">Viewers</p>
                <p className="text-white font-black text-2xl">{viewerCount}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-1">Puja actual</p>
                <p className="text-amber-400 font-black text-2xl">{latestBid.toLocaleString()}€</p>
                {latestBidder && <p className="text-gray-500 text-[10px] mt-0.5 truncate">por {latestBidder}</p>}
              </div>
              <div>
                <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-1">Tiempo</p>
                <p className="font-black text-2xl" style={{ color: timerUrgent ? '#ef4444' : '#ffffff', textShadow: timerUrgent ? '0 0 12px #ef444480' : 'none' }}>
                  {formatTime(timeLeft)}
                </p>
              </div>
            </div>
          </div>

          {/* Chat */}
          <ChatSidebar
            auctionId={id}
            role="seller"
            externalMessages={messages}
            externalSend={sendMessage}
            externalStatus={status}
          />
        </div>
      </main>
    </div>
  );
}
