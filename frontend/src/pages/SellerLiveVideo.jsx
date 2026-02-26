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

// ── Seller camera preview component ─────────────────────────────────────────
function SellerVideo({ localRef, status, viewerCount, onGoLive, isStreaming }) {
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
      <video
        ref={localRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full block"
        style={{ background: '#000', objectFit: 'cover' }}
      />

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

// ── Main seller page ─────────────────────────────────────────────────────────
export default function SellerLiveVideo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const username = user?.username || user?.email || 'Anonymous';

  // One shared WS connection for the seller
  const { status, messages, viewerCount, sendMessage, sendSignal, setSignalHandler } =
    useWebSocket(id, username, 'seller');

  const localRef = useRef(null);
  const streamRef = useRef(null);
  // Map<viewerSessionId, { pc: RTCPeerConnection, iceQueue: RTCIceCandidateInit[] }>
  const peersRef = useRef(new Map());

  const [isStreaming, setIsStreaming] = React.useState(false);
  const [isEnding, setIsEnding] = React.useState(false);

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
    if (!streamRef.current) {
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
  }, [createPcForViewer, sendSignal]);

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
      } catch (err) {
        console.error('[Seller] signal handler error:', err);
      }
    };

    setSignalHandler(handler);
    return () => setSignalHandler(null);
  }, [status, setSignalHandler, sendOfferToViewer]);

  // ── Go Live: capture camera, send SELLER_LIVE, update DB ────────────────
  const startBroadcast = async () => {
    if (isStreaming || streamRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } },
        audio: true,
      });
      streamRef.current = stream;
      if (localRef.current) localRef.current.srcObject = stream;
      setIsStreaming(true);

      // Tell all waiting viewers the seller is now live
      sendSignal('SELLER_LIVE', {});
      console.log('[Seller] SELLER_LIVE sent');

      // Update auction status in DB
      fetch(`${API_URL}/auction/pujas/${id}/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }).then(r => console.log(`[Seller] start API → ${r.status}`))
        .catch(err => console.error('[Seller] start API error:', err));

    } catch (err) {
      console.error('[Seller] getUserMedia error:', err);
      alert('Camera/microphone access required to go live.');
    }
  };

  // ── End live: stop tracks, update DB, signal viewers, navigate ──────────
  const endLive = async () => {
    if (isEnding) return;
    setIsEnding(true);

    // Stop local camera/mic immediately
    streamRef.current?.getTracks().forEach(t => t.stop());
    // Close all peer connections
    peersRef.current.forEach(({ pc }) => pc.close());
    peersRef.current.clear();

    try {
      await fetch(`${API_URL}/auction/pujas/${id}/end`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
    } catch (err) {
      console.error('[Seller] endLive API error (non-critical):', err);
    }

    sendSignal('END_AUCTION', { auctionId: id });
    setTimeout(() => navigate('/seller'), 600);
  };

  // ── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      peersRef.current.forEach(({ pc }) => pc.close());
    };
  }, []);

  // Latest bid from WS messages
  const latestBid = messages
    .filter(m => m.type === 'BID_PLACED')
    .reduce((acc, m) => Math.max(acc, Number(m.payload?.amount) || 0), 0);
  const latestBidder = [...messages].reverse().find(m => m.type === 'BID_PLACED')?.payload?.username;

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
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
          <button onClick={endLive} disabled={isEnding} className="btn-danger text-xs py-1.5 px-3 disabled:opacity-50">
            {isEnding ? 'Ending...' : 'End live'}
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 grid overflow-hidden" style={{ gridTemplateColumns: '1fr 380px' }}>
        {/* Left: video fills the column */}
        <div className="flex items-center justify-center overflow-hidden" style={{ background: '#000' }}>
          <SellerVideo
            localRef={localRef}
            status={status}
            viewerCount={viewerCount}
            onGoLive={startBroadcast}
            isStreaming={isStreaming}
          />
        </div>

        {/* Right: info panel + chat stacked */}
        <div className="flex flex-col h-full overflow-hidden" style={{ borderLeft: '1px solid var(--border)' }}>
          {/* Stats panel */}
          <div className="shrink-0 p-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-1">Viewers</p>
                <p className="text-white font-black text-2xl">{viewerCount}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-1">Current bid</p>
                <p className="text-amber-400 font-black text-2xl">${latestBid.toLocaleString()}</p>
                {latestBidder && <p className="text-gray-600 text-[10px] mt-0.5">by {latestBidder}</p>}
              </div>
              <div>
                <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-1">Status</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-2 h-2 rounded-full"
                    style={{ background: status === 'connected' ? '#22c55e' : '#6b7280', boxShadow: status === 'connected' ? '0 0 8px #22c55e' : 'none' }} />
                  <span className="text-white font-semibold text-sm capitalize">{status}</span>
                </div>
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
