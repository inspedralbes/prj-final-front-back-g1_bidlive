import React, { useState, useRef, useEffect } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAuth } from '../../context/AuthContext';

const formatTime = (iso) => {
    try {
        return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
};

const MessageItem = ({ msg }) => {
    const isBid = msg.type === 'BID_PLACED';
    return (
        <div
            className={`flex flex-col gap-0.5 px-4 py-2.5 group animate-slide-right ${isBid ? 'animate-bid-flash rounded-lg' : ''}`}
            style={isBid ? { background: 'rgba(245,158,11,0.07)' } : {}}
        >
            <div className="flex items-center gap-2">
                {isBid ? (
                    <span className="badge-amber text-[11px]">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                        BID
                    </span>
                ) : (
                    <span className="text-xs font-bold text-amber-400">{msg.payload?.username || 'Anonymous'}</span>
                )}
                <span className="text-[11px] text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatTime(msg.payload?.timestamp)}
                </span>
            </div>
            {isBid ? (
                <p className="text-amber-300 font-black text-base">
                    ${Number(msg.payload?.amount).toLocaleString()}
                    <span className="text-gray-500 text-xs font-normal ml-2">by {msg.payload?.username}</span>
                </p>
            ) : (
                <p className="text-gray-300 text-sm leading-snug break-words">{msg.payload?.message}</p>
            )}
        </div>
    );
};

/**
 * ChatSidebar — full-height chat panel.
 * When used standalone (e.g. in LiveAuctionVideo) it manages its own WS.
 * Props:
 *  auctionId string
 *  role      'seller' | 'viewer'
 *  externalMessages  – pass messages array from parent if WS is shared
 *  externalSend      – pass sendMessage fn from parent if WS is shared
 *  externalStatus    – connection status from parent
 */
export default function ChatSidebar({
    auctionId,
    role = 'viewer',
    externalMessages,
    externalSend,
    externalStatus,
}) {
    const { user } = useAuth();
    const username = user?.username || user?.email || 'Anonymous';

    const internal = useWebSocket(
        externalMessages ? null : auctionId,
        externalMessages ? null : username,
        role
    );

    const messages = externalMessages ?? internal.messages;
    const sendMessage = externalSend ?? internal.sendMessage;
    const status = externalStatus ?? internal.status;

    const [input, setInput] = useState('');
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || status !== 'connected') return;
        sendMessage(text);
        setInput('');
        inputRef.current?.focus();
    };

    const statusDot = {
        connected: { color: '#22c55e', label: 'Live' },
        connecting: { color: '#f59e0b', label: 'Connecting' },
        disconnected: { color: '#6b7280', label: 'Offline' },
        error: { color: '#ef4444', label: 'Error' },
    }[status] || { color: '#6b7280', label: status };

    return (
        <div
            className="flex flex-col h-full min-h-0"
            style={{
                background: 'var(--bg-surface)',
                borderLeft: '1px solid var(--border)',
            }}
        >
            {/* Header */}
            <div className="px-4 py-3.5 flex items-center justify-between shrink-0"
                style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span className="text-white font-bold text-sm">Live Chat</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: statusDot.color, boxShadow: `0 0 6px ${statusDot.color}` }} />
                    <span className="text-xs font-medium" style={{ color: statusDot.color }}>{statusDot.label}</span>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-0 overflow-y-auto scroll-area py-2">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-600 text-sm">No messages yet.<br />Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, i) => <MessageItem key={i} msg={msg} />)
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form
                onSubmit={handleSend}
                className="shrink-0 p-3"
                style={{ borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}
            >
                <div className="flex gap-2 items-end">
                    <input
                        ref={inputRef}
                        className="input-field text-sm py-2.5 px-3 flex-1"
                        placeholder={status === 'connected' ? 'Say something...' : 'Connecting...'}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        disabled={status !== 'connected'}
                        maxLength={300}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || status !== 'connected'}
                        className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                        style={{ background: 'var(--accent)', color: '#08080f' }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
}
