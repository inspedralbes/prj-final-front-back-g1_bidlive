import React, { useEffect, useRef, useCallback } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAuth } from '../../context/AuthContext';

/**
 * VideoPlayer — handles WebRTC as either "seller" (broadcaster) or "viewer" (receiver).
 * Signaling via WebSocket using OFFER / ANSWER / ICE_CANDIDATE messages.
 *
 * Props:
 *  auctionId  string  – room id
 *  role       'seller' | 'viewer'
 *  autoStart  bool    – seller: auto-request camera on mount
 *  viewerCount number – optional override (passed from parent)
 */
export default function VideoPlayer({ auctionId, role = 'viewer', autoStart = false, viewerCount }) {
  const { user } = useAuth();
  const username = user?.username || user?.email || 'Anonymous';

  const { status, sendSignal, viewerCount: wsViewerCount } = useWebSocket(auctionId, username, role);

  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const pcRef = useRef(null);
  const streamRef = useRef(null);

  const displayedViewers = viewerCount ?? wsViewerCount;
  const isLive = status === 'connected';

  // ─── Seller: start webcam + create RTCPeerConnection ──────────────────────
  const startBroadcast = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (localRef.current) localRef.current.srcObject = stream;

      const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      pcRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.onicecandidate = e => {
        if (e.candidate) sendSignal('ICE_CANDIDATE', { candidate: e.candidate });
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal('OFFER', { sdp: offer });
    } catch (err) {
      console.error('[VideoPlayer] startBroadcast error:', err);
    }
  }, [sendSignal]);

  // ─── Viewer: create RTCPeerConnection ready to receive ────────────────────
  const initViewerPc = useCallback(() => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pcRef.current = pc;

    pc.ontrack = e => {
      if (remoteRef.current && e.streams[0]) remoteRef.current.srcObject = e.streams[0];
    };

    pc.onicecandidate = e => {
      if (e.candidate) sendSignal('ICE_CANDIDATE', { candidate: e.candidate });
    };

    return pc;
  }, [sendSignal]);

  useEffect(() => {
    if (role === 'seller' && autoStart && status === 'connected') {
      startBroadcast();
    }
    if (role === 'viewer' && status === 'connected') {
      initViewerPc();
    }
  }, [role, autoStart, status, startBroadcast, initViewerPc]);

  // Cleanup
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      pcRef.current?.close();
    };
  }, []);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden" style={{ background: '#000', border: '1px solid var(--border)' }}>
      {/* Video elements */}
      {role === 'seller' ? (
        <video
          ref={localRef}
          autoPlay
          playsInline
          muted
          className="w-full aspect-video object-cover"
          style={{ display: 'block', background: '#000' }}
        />
      ) : (
        <video
          ref={remoteRef}
          autoPlay
          playsInline
          className="w-full aspect-video object-cover"
          style={{ display: 'block', background: '#000' }}
        />
      )}

      {/* Placeholder when no stream */}
      {role === 'viewer' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ opacity: 0.5 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
            <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" />
          </svg>
          <p className="text-white/40 text-sm mt-3 font-medium">
            {status === 'connecting' ? 'Connecting...' : status === 'connected' ? 'Waiting for stream...' : 'Not connected'}
          </p>
        </div>
      )}

      {/* Top overlays */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
        {isLive ? (
          <span className="badge-live">
            <span className="live-dot" /> LIVE
          </span>
        ) : (
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ background: 'rgba(0,0,0,0.6)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)' }}>
            {status === 'connecting' ? 'Connecting...' : 'Offline'}
          </span>
        )}
      </div>

      {/* Viewers */}
      {isLive && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 text-xs font-medium text-white px-2.5 py-1.5 rounded-full"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" opacity="0.8">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
          </svg>
          {displayedViewers} watching
        </div>
      )}

      {/* Seller: start button overlay */}
      {role === 'seller' && !autoStart && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
          <button
            onClick={startBroadcast}
            className="btn-primary text-base px-8 py-3.5 gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            Go Live
          </button>
        </div>
      )}
    </div>
  );
}
