import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAuth } from '../../context/AuthContext';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

/**
 * VideoPlayer
 * - Seller: one RTCPeerConnection per viewer (Map), broadcasts SELLER_LIVE when going live.
 * - Viewer: retries REQUEST_OFFER every 4s until it gets an OFFER.
 * - Uses setSignalHandler — no onmessage override.
 *
 * Props:
 *   auctionId   string
 *   role        'seller' | 'viewer'
 *   autoStart   bool    – seller: skip button, start camera on mount
 *   viewerCount number  – override from parent
 *   onAuctionEnd fn     – called when auction ends
 *   // Seller page can pass its WS hook to avoid a double connection:
 *   externalWs  { status, sendSignal, setSignalHandler, auctionEnded }
 */
export default function VideoPlayer({
  auctionId, role = 'viewer', autoStart = false,
  viewerCount, onAuctionEnd, externalWs,
  categoryIcon, categoryName,
  mode, imageUrl, auctionTitle, auctionDescription
}) {
  const { user } = useAuth();
  const username = user?.username || user?.email || 'Anonymous';

  // Use external WS if provided (seller shares its connection), else create own
  const internal = useWebSocket(externalWs ? null : auctionId, username, role);
  const { status, sendSignal, setSignalHandler, viewerCount: wsViewerCount, auctionEnded } =
    externalWs ?? internal;

  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const streamRef = useRef(null);
  const containerRef = useRef(null);

  // Seller: Map<viewerSessionId, { pc, iceQueue[] }>
  const peersRef = useRef(new Map());

  // Viewer: single PeerConnection
  const pcRef = useRef(null);
  const iceQueueRef = useRef([]);
  const remoteDescSetRef = useRef(false);
  const retryTimerRef = useRef(null);

  const [broadcasting, setBroadcasting] = useState(false);
  const [streamEnded, setStreamEnded] = useState(false);
  const [hasStream, setHasStream] = useState(false);

  // Controls UI
  const [showControls, setShowControls] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(role === 'viewer');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hideControlsTimer = useRef(null);

  const displayedViewers = viewerCount ?? wsViewerCount;
  const isLive = status === 'connected';

  // ── Track fullscreen changes ────────────────────────────────────────────────
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // ── Volume/Mute sync to video element ───────────────────────────────────────────
  useEffect(() => {
    const vid = role === 'seller' ? localRef.current : remoteRef.current;
    if (vid) {
      if (role === 'seller') {
        vid.volume = 0;
        vid.muted = true;
      } else {
        vid.volume = volume;
        vid.muted = isMuted;
      }
    }
  }, [volume, isMuted, role]);

  // ── AUCTION_ENDED ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!auctionEnded) return;
    setStreamEnded(true);
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (role === 'seller') { peersRef.current.forEach(({ pc }) => pc.close()); peersRef.current.clear(); }
    else pcRef.current?.close();
    if (retryTimerRef.current) clearInterval(retryTimerRef.current);
    onAuctionEnd?.();
  }, [auctionEnded, role, onAuctionEnd]);

  // ── Seller: create/reuse PeerConnection for one viewer ────────────────────
  const createSellerPc = useCallback((viewerSessionId) => {
    if (peersRef.current.has(viewerSessionId)) return peersRef.current.get(viewerSessionId).pc;

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => pc.addTrack(track, streamRef.current));
    }

    pc.onicecandidate = (e) => {
      if (e.candidate) sendSignal('ICE_CANDIDATE', { candidate: e.candidate, targetId: viewerSessionId });
    };

    pc.onconnectionstatechange = () => {
      if (['failed', 'closed'].includes(pc.connectionState)) peersRef.current.delete(viewerSessionId);
    };

    peersRef.current.set(viewerSessionId, { pc, iceQueue: [] });
    return pc;
  }, [sendSignal]);

  // ── Seller: send offer to one viewer ──────────────────────────────────────
  const sendOfferToViewer = useCallback(async (viewerSessionId) => {
    if (!streamRef.current) { console.warn('[Seller] No stream yet, ignoring REQUEST_OFFER'); return; }
    const pc = createSellerPc(viewerSessionId);
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal('OFFER', { sdp: offer, targetId: viewerSessionId });
      console.log(`[Seller] OFFER sent → viewer [${viewerSessionId}]`);
    } catch (err) {
      console.error('[Seller] createOffer error:', err);
    }
  }, [createSellerPc, sendSignal]);

  // ── Seller: start broadcast ────────────────────────────────────────────────
  const startBroadcast = useCallback(async () => {
    if (broadcasting || streamRef.current) return;
    try {
      // Request the highest available resolution from the webcam
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: true,
      });
      streamRef.current = stream;
      if (localRef.current) {
        localRef.current.srcObject = stream;
        localRef.current.volume = 0; // always mute local preview
      }
      setBroadcasting(true);

      sendSignal('SELLER_LIVE', {});
      console.log('[Seller] SELLER_LIVE broadcast sent');

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      fetch(`${API_URL}/auction/pujas/${auctionId}/start`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      }).then(r => console.log(`[Seller] start API → ${r.status}`))
        .catch(err => console.error('[Seller] start API error:', err));

    } catch (err) {
      console.error('[VideoPlayer] getUserMedia error:', err);
    }
  }, [broadcasting, auctionId, sendSignal]);

  // ── Viewer: init PeerConnection ────────────────────────────────────────────
  const initViewerPc = useCallback(() => {
    pcRef.current?.close();
    iceQueueRef.current = [];
    remoteDescSetRef.current = false;

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcRef.current = pc;

    pc.ontrack = (e) => {
      console.log('[Viewer] ontrack fired');
      if (remoteRef.current && e.streams[0]) {
        remoteRef.current.srcObject = e.streams[0];
        remoteRef.current.volume = volume;
        setHasStream(true);
      }
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) sendSignal('ICE_CANDIDATE', { candidate: e.candidate });
    };

    return pc;
  }, [sendSignal, volume]);

  // ── Viewer: send REQUEST_OFFER with retry until we get an OFFER ───────────
  const requestOffer = useCallback(() => {
    if (retryTimerRef.current) clearInterval(retryTimerRef.current);
    sendSignal('REQUEST_OFFER', {});
    console.log('[Viewer] REQUEST_OFFER sent');

    retryTimerRef.current = setInterval(() => {
      if (remoteDescSetRef.current) { clearInterval(retryTimerRef.current); return; }
      sendSignal('REQUEST_OFFER', {});
      console.log('[Viewer] REQUEST_OFFER retry...');
    }, 4000);
  }, [sendSignal]);

  // ── Register signal handler ────────────────────────────────────────────────
  useEffect(() => {
    if (status !== 'connected') return;

    const handler = async (data) => {
      try {
        // ── SELLER handling ─────────────────────────────────────────
        if (role === 'seller') {
          if (data.type === 'REQUEST_OFFER') {
            await sendOfferToViewer(data.payload?.fromId);
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
            }
          }
          if (data.type === 'ICE_CANDIDATE') {
            const { fromId, candidate } = data.payload;
            const entry = peersRef.current.get(fromId);
            if (!entry || !candidate) return;
            const { pc, iceQueue } = entry;
            if (pc.remoteDescription) await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => { });
            else iceQueue.push(candidate);
          }
        }

        // ── VIEWER handling ─────────────────────────────────────────
        if (role === 'viewer') {
          if (data.type === 'SELLER_LIVE') {
            console.log('[Viewer] SELLER_LIVE received → requesting offer');
            initViewerPc();
            requestOffer();
          }
          if (data.type === 'OFFER') {
            const pc = pcRef.current;
            if (!pc) return;
            await pc.setRemoteDescription(new RTCSessionDescription(data.payload.sdp));
            remoteDescSetRef.current = true;
            if (retryTimerRef.current) clearInterval(retryTimerRef.current);

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            sendSignal('ANSWER', { sdp: answer });
            console.log('[Viewer] ANSWER sent');

            for (const c of iceQueueRef.current) await pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => { });
            iceQueueRef.current = [];
          }
          if (data.type === 'ICE_CANDIDATE') {
            const pc = pcRef.current;
            const candidate = data.payload?.candidate;
            if (!pc || !candidate) return;
            if (remoteDescSetRef.current) await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => { });
            else iceQueueRef.current.push(candidate);
          }
          if (data.type === 'SELLER_LEFT') {
            setStreamEnded(true);
            if (retryTimerRef.current) clearInterval(retryTimerRef.current);
          }
        }

        if (data.type === 'AUCTION_ENDED' || data.type === 'SELLER_LEFT') setStreamEnded(true);

      } catch (err) { console.error('[VideoPlayer] signal handler error:', err); }
    };

    setSignalHandler(handler);
    return () => setSignalHandler(null);
  }, [role, status, setSignalHandler, sendSignal, sendOfferToViewer, initViewerPc, requestOffer]);

  // ── Auto-start (viewer connects: init PC + request offer) ─────────────────
  useEffect(() => {
    if (mode === 'photo') return; // Skip WebRTC for photo-only mode
    if (status !== 'connected') return;
    if (role === 'seller' && autoStart) startBroadcast();
    if (role === 'viewer') {
      initViewerPc();
      requestOffer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // ── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (role === 'seller') { peersRef.current.forEach(({ pc }) => pc.close()); }
    else pcRef.current?.close();
    if (retryTimerRef.current) clearInterval(retryTimerRef.current);
  }, [role]);

  // ── Controls hover helpers ─────────────────────────────────────────────────
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => setShowControls(false), 2500);
  };

  const handleMouseLeave = () => {
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    setShowControls(false);
  };

  // ── Fullscreen toggle ──────────────────────────────────────────────────────
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err =>
        console.warn('[VideoPlayer] Fullscreen error:', err)
      );
    } else {
      document.exitFullscreen();
    }
  };

  // ── Volume change ─────────────────────────────────────────────────────────
  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
  };

  // ── Volume icon helper ────────────────────────────────────────────────────
  const VolumeIcon = () => {
    if (isMuted || volume === 0) return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
      </svg>
    );
    if (volume < 0.5) return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
    );
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
    );
  };

  // ── Photo-only mode: render premium glassmorphic product card ─────────────
  if (mode === 'photo') {
    return (
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #0a0a18 0%, #08080f 100%)',
          border: '1px solid rgba(245,158,11,0.25)',
          height: '100%',
          width: '100%',
          boxShadow: '0 0 60px rgba(245,158,11,0.08)',
        }}
      >
        {/* Ambient glow */}
        <div style={{ position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Product card */}
        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '420px',
            width: '90%',
            boxShadow: '0 0 40px rgba(245,158,11,0.1), inset 0 1px 0 rgba(255,255,255,0.06)',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {/* MODO FOTO badge */}
          <div style={{
            position: 'absolute',
            top: '-14px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: '#08080f',
            fontWeight: '900',
            fontSize: '10px',
            letterSpacing: '0.18em',
            padding: '4px 14px',
            borderRadius: '999px',
            animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
            whiteSpace: 'nowrap',
          }}>
            ■ MODO FOTO
          </div>

          {/* Product image */}
          {imageUrl ? (
            <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', border: '1px solid rgba(245,158,11,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
              <img src={imageUrl} alt={auctionTitle || 'Auction item'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : (
            <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: '16px', background: 'rgba(245,158,11,0.06)', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(245,158,11,0.2)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '64px', color: 'rgba(245,158,11,0.3)' }}>image</span>
            </div>
          )}

          {auctionTitle && (
            <h3 style={{ color: '#ffffff', fontWeight: '900', fontSize: '18px', margin: '0 0 8px', lineHeight: 1.3 }}>{auctionTitle}</h3>
          )}
          {auctionDescription && (
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{auctionDescription}</p>
          )}
        </div>

        {/* Live badge top-left */}
        <div className="absolute top-3 left-3 z-10">
          <span className="badge-live"><span className="live-dot" /> LIVE</span>
        </div>

        {/* Viewer count */}
        {viewerCount !== undefined && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 text-xs font-medium text-white px-2.5 py-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" opacity="0.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
            {viewerCount} watching
          </div>
        )}
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden"
      style={{
        background: '#000',
        border: '1px solid var(--border)',
        height: isFullscreen ? '100vh' : '100%',
        width: '100%',
        cursor: 'default',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Video element ── */}
      {role === 'seller'
        ? <video
          ref={localRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full"
          style={{
            display: 'block',
            background: '#000',
            objectFit: 'cover',
          }}
        />
        : <video
          ref={remoteRef}
          autoPlay
          playsInline
          muted={isMuted}
          className="w-full h-full"
          style={{
            display: 'block',
            background: '#000',
            objectFit: 'cover',
          }}
        />
      }

      {/* ── Tap to unmute overlay (viewer only, when muted) ── */}
      {role === 'viewer' && hasStream && isMuted && !streamEnded && (
        <button
          onClick={() => {
            setIsMuted(false);
            if (volume === 0) setVolume(1);
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border transition-all active:scale-95 hover:scale-105"
          style={{
            background: 'rgba(8, 8, 15, 0.85)',
            backdropFilter: 'blur(16px)',
            borderColor: 'rgba(245, 158, 11, 0.4)',
            color: '#fff',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center animate-bounce" style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <span className="material-symbols-outlined text-amber-400 text-2xl">
              volume_off
            </span>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Activar sonido</span>
        </button>
      )}

      {/* ── Auction ended overlay ── */}
      {streamEnded && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <p className="text-white/70 text-base font-semibold">La subasta ha finalizado</p>
        </div>
      )}

      {/* ── Viewer: waiting for stream ── */}
      {role === 'viewer' && !streamEnded && !hasStream && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-4" 
               style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="material-symbols-outlined text-amber-400/20" style={{ fontSize: '56px' }}>
              {categoryIcon || 'videocam_off'}
            </span>
          </div>
          <p className="text-white/30 text-xs font-bold uppercase tracking-[0.2em]">
            {status === 'connecting' ? 'Connecting...' : `Waiting for ${categoryName || 'Stream'}...`}
          </p>
        </div>
      )}

      {/* ── LIVE badge ── */}
      <div className="absolute top-3 left-3 z-10">
        {isLive && !streamEnded
          ? <span className="badge-live"><span className="live-dot" /> LIVE</span>
          : !streamEnded && (
            <span
              className="text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{ background: 'rgba(0,0,0,0.6)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {status === 'connecting' ? 'Connecting...' : 'Offline'}
            </span>
          )
        }
      </div>

      {/* ── Viewer count (top-right, hides when controls show) ── */}
      {isLive && !streamEnded && (
        <div
          className="absolute top-3 right-3 z-10 flex items-center gap-1.5 text-xs font-medium text-white px-2.5 py-1.5 rounded-full"
          style={{
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            transition: 'opacity 0.2s',
            opacity: showControls ? 0 : 1,
            pointerEvents: 'none',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" opacity="0.8">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
          </svg>
          {displayedViewers} watching
        </div>
      )}

      {/* ── Bottom control bar (hover reveal) ── */}
      {!streamEnded && (
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
          {isLive && (
            <div className="flex items-center gap-1.5 text-white/70 text-xs font-medium">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
              </svg>
              {displayedViewers}
            </div>
          )}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Volume controls (viewer only) */}
          {role === 'viewer' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (isMuted) {
                    setIsMuted(false);
                    if (volume === 0) setVolume(1);
                  } else {
                    setIsMuted(true);
                  }
                }}
                className="text-white/80 hover:text-white transition-colors"
                title={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
              >
                <VolumeIcon />
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={volume}
                onChange={handleVolumeChange}
                style={{
                  width: '80px',
                  accentColor: '#f59e0b',
                  cursor: 'pointer',
                  height: '4px',
                }}
                title="Volume"
              />
            </div>
          )}

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="text-white/80 hover:text-white transition-colors ml-1"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              /* Exit fullscreen icon */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
              </svg>
            ) : (
              /* Enter fullscreen icon */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* ── Seller: Go Live button ── */}
      {role === 'seller' && !autoStart && !broadcasting && !streamEnded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
          <button onClick={startBroadcast} disabled={status !== 'connected'} className="btn-primary text-base px-8 py-3.5 gap-2 disabled:opacity-50">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            {status === 'connected' ? 'Go Live' : 'Connecting...'}
          </button>
        </div>
      )}
    </div>
  );
}
