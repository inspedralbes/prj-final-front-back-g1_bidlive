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

  // Seller: Map<viewerSessionId, { pc, iceQueue[] }>
  const peersRef = useRef(new Map());

  // Viewer: single PeerConnection
  const pcRef = useRef(null);
  const iceQueueRef = useRef([]);
  const remoteDescSetRef = useRef(false);
  const retryTimerRef = useRef(null);

  const [broadcasting, setBroadcasting] = useState(false);
  const [streamEnded, setStreamEnded] = useState(false);
  const [hasStream, setHasStream] = useState(false); // true once viewer receives real video

  const displayedViewers = viewerCount ?? wsViewerCount;
  const isLive = status === 'connected';

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
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (localRef.current) localRef.current.srcObject = stream;
      setBroadcasting(true);

      // ↓ KEY FIX: Tell all waiting viewers that seller is now live
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
        setHasStream(true); // hide "Waiting for stream..." overlay
      }
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) sendSignal('ICE_CANDIDATE', { candidate: e.candidate });
    };

    return pc;
  }, [sendSignal]);

  // ── Viewer: send REQUEST_OFFER with retry until we get an OFFER ───────────
  const requestOffer = useCallback(() => {
    if (retryTimerRef.current) clearInterval(retryTimerRef.current);
    sendSignal('REQUEST_OFFER', {});
    console.log('[Viewer] REQUEST_OFFER sent');

    // Retry every 4 seconds until we get an offer (remoteDescSetRef becomes true)
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
            // Seller just went live — request an offer
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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full rounded-2xl overflow-hidden" style={{ background: '#000', border: '1px solid var(--border)' }}>
      {role === 'seller'
        ? <video ref={localRef} autoPlay playsInline muted className="w-full aspect-video object-cover" style={{ display: 'block', background: '#000' }} />
        : <video ref={remoteRef} autoPlay playsInline className="w-full aspect-video object-cover" style={{ display: 'block', background: '#000' }} />
      }

      {/* Auction ended overlay */}
      {streamEnded && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <p className="text-white/70 text-base font-semibold">La subasta ha finalizado</p>
        </div>
      )}

      {/* Viewer: waiting for stream */}
      {role === 'viewer' && !streamEnded && !hasStream && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ opacity: 0.5 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
            <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" />
          </svg>
          <p className="text-white/40 text-sm mt-3 font-medium">
            {status === 'connecting' ? 'Connecting...' : 'Waiting for stream...'}
          </p>
        </div>
      )}

      {/* LIVE badge */}
      <div className="absolute top-4 left-4 z-10">
        {isLive && !streamEnded
          ? <span className="badge-live"><span className="live-dot" /> LIVE</span>
          : !streamEnded && <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(0,0,0,0.6)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)' }}>{status === 'connecting' ? 'Connecting...' : 'Offline'}</span>
        }
      </div>

      {/* Viewer count */}
      {isLive && !streamEnded && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 text-xs font-medium text-white px-2.5 py-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" opacity="0.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
          {displayedViewers} watching
        </div>
      )}

      {/* Seller: Go Live button */}
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
