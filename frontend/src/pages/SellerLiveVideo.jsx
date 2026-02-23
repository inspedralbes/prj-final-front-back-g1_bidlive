import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import ChatSidebar from '../components/auction/ChatSidebar';

function SellerVideo({ localRef, status, viewerCount, onGoLive, isStreaming }) {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden" style={{ background: '#000', border: '1px solid rgba(255,255,255,0.07)' }}>
      <video ref={localRef} autoPlay playsInline muted className="w-full aspect-video object-cover block" style={{ background: '#000' }} />

      {/* Overlays */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        {isStreaming
          ? <span className="badge-live"><span className="live-dot" /> BROADCASTING</span>
          : <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(0,0,0,0.7)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }}>Camera preview</span>
        }
      </div>
      {isStreaming && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 text-xs font-medium text-white px-2.5 py-1.5 rounded-full"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.09)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" opacity="0.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
          {viewerCount} watching
        </div>
      )}

      {/* Go Live overlay */}
      {!isStreaming && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <button onClick={onGoLive} className="btn-primary text-base px-8 py-3.5 gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            Go Live
          </button>
        </div>
      )}
    </div>
  );
}

export default function SellerLiveVideo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const username = user?.username || user?.email || 'Anonymous';

  const { status, messages, viewerCount, sendMessage, sendSignal, ws } = useWebSocket(id, username, 'seller');

  const localRef = useRef(null);
  const pcRef = useRef(null);
  const streamRef = useRef(null);
  const streamingRef = useRef(false);
  const [isStreaming, setIsStreaming] = React.useState(false);

  const startBroadcast = async () => {
    if (streamingRef.current) return;
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

      // Handle ANSWER from viewer
      if (ws.current) {
        const prev = ws.current.onmessage;
        ws.current.onmessage = (event) => {
          prev?.(event);
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'ANSWER') {
              pc.setRemoteDescription(new RTCSessionDescription(data.payload.sdp)).catch(() => { });
            }
            if (data.type === 'ICE_CANDIDATE' && data.payload?.candidate) {
              pc.addIceCandidate(new RTCIceCandidate(data.payload.candidate)).catch(() => { });
            }
          } catch { /* ignore */ }
        };
      }

      streamingRef.current = true;
      setIsStreaming(true);
    } catch (err) {
      console.error('[Seller] Camera error:', err);
      alert('Camera/microphone access required to go live.');
    }
  };

  const endLive = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    pcRef.current?.close();
    navigate('/seller');
  };

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      pcRef.current?.close();
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
          <button
            onClick={() => navigate('/seller')}
            className="btn-ghost text-xs py-1.5 px-3"
          >
            Dashboard
          </button>
          <button
            onClick={endLive}
            className="btn-danger text-xs py-1.5 px-3"
          >
            End live
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 grid overflow-hidden" style={{ gridTemplateColumns: '1fr 360px' }}>
        {/* Left */}
        <div className="flex flex-col overflow-y-auto scroll-area p-5 gap-5">
          <SellerVideo
            localRef={localRef}
            status={status}
            viewerCount={viewerCount}
            onGoLive={startBroadcast}
            isStreaming={isStreaming}
          />

          {/* Controls panel */}
          <div className="rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="sm:col-span-1">
              <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Viewers</p>
              <p className="text-white font-black text-3xl">{viewerCount}</p>
            </div>
            <div className="sm:col-span-1">
              <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Current bid</p>
              <p className="text-amber-400 font-black text-3xl">${latestBid.toLocaleString()}</p>
              {latestBidder && <p className="text-gray-600 text-xs mt-0.5">by {latestBidder}</p>}
            </div>
            <div className="sm:col-span-1">
              <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Status</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2.5 h-2.5 rounded-full"
                  style={{ background: status === 'connected' ? '#22c55e' : '#6b7280', boxShadow: status === 'connected' ? '0 0 8px #22c55e' : 'none' }} />
                <span className="text-white font-semibold capitalize">{status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: chat */}
        <ChatSidebar
          auctionId={id}
          role="seller"
          externalMessages={messages}
          externalSend={sendMessage}
          externalStatus={status}
        />
      </main>
    </div>
  );
}
