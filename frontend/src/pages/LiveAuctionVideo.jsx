import React, { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import ChatSidebar from '../components/auction/ChatSidebar';
import BiddingHUD from '../components/auction/BiddingHUD';

// Minimal inline VideoPlayer for viewer so we can share the same WS instance
function ViewerVideo({ remoteRef, status, viewerCount }) {
  const isLive = status === 'connected';
  return (
    <div className="relative w-full rounded-2xl overflow-hidden" style={{ background: '#000', border: '1px solid rgba(255,255,255,0.07)' }}>
      <video
        ref={remoteRef}
        autoPlay
        playsInline
        className="w-full aspect-video object-cover block"
        style={{ background: '#000' }}
      />
      {/* Waiting overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ opacity: 0.45 }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1">
          <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" />
        </svg>
        <p className="text-white/30 text-sm mt-3">
          {status === 'connecting' ? 'Connecting...' : status === 'connected' ? 'Waiting for stream…' : 'Offline'}
        </p>
      </div>
      {/* LIVE badge */}
      <div className="absolute top-4 left-4 z-10">
        {isLive
          ? <span className="badge-live"><span className="live-dot" /> LIVE</span>
          : <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(0,0,0,0.65)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' }}>{status}</span>
        }
      </div>
      {/* Viewer count */}
      {isLive && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 text-xs font-medium text-white px-2.5 py-1.5 rounded-full"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.09)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" opacity="0.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
          {viewerCount} watching
        </div>
      )}
    </div>
  );
}

export default function LiveAuctionVideo() {
  const { id } = useParams();
  const { user } = useAuth();
  const username = user?.username || user?.email || 'Anonymous';

  const { status, messages, viewerCount, sendMessage, sendSignal, placeBid, ws } = useWebSocket(id, username, 'viewer');

  const remoteRef = useRef(null);
  const pcRef = useRef(null);

  // Current bid from BID_PLACED messages
  const latestBid = messages
    .filter(m => m.type === 'BID_PLACED')
    .reduce((acc, m) => Math.max(acc, Number(m.payload?.amount) || 0), 0);

  // WebRTC viewer logic
  useEffect(() => {
    if (status !== 'connected') return;
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pcRef.current = pc;

    pc.ontrack = (e) => {
      if (remoteRef.current && e.streams[0]) remoteRef.current.srcObject = e.streams[0];
    };
    pc.onicecandidate = (e) => {
      if (e.candidate) sendSignal('ICE_CANDIDATE', { candidate: e.candidate });
    };

    // Listen for offer
    const handleOffer = async (offer) => {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendSignal('ANSWER', { sdp: answer });
    };

    // Intercept raw WS messages from the shared ws ref for OFFER/ICE
    const origOnMessage = ws.current?.onmessage;
    if (ws.current) {
      ws.current.onmessage = (event) => {
        origOnMessage?.(event);
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'OFFER') handleOffer(data.payload.sdp);
          if (data.type === 'ICE_CANDIDATE' && data.payload?.candidate) {
            pc.addIceCandidate(new RTCIceCandidate(data.payload.candidate)).catch(() => { });
          }
        } catch { /* ignore */ }
      };
    }

    return () => {
      pc.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      {/* Top bar */}
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

      {/* Main layout */}
      <main className="flex-1 grid overflow-hidden" style={{ gridTemplateColumns: '1fr 360px' }}>
        {/* Left: video + bidding info */}
        <div className="flex flex-col overflow-y-auto scroll-area p-5 gap-5">
          <ViewerVideo remoteRef={remoteRef} status={status} viewerCount={viewerCount} />
          <BiddingHUD
            currentBid={latestBid}
            placeBid={placeBid}
            disabled={status !== 'connected'}
          />
          {/* Auction info card */}
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
