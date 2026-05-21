import { useState, useEffect, useRef, useCallback } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/bidding/';

/**
 * useWebSocket — connects to the bidding/signaling WebSocket service.
 *
 * @param {string} auctionId
 * @param {string} username
 * @param {'seller'|'viewer'} role
 *
 * Returns:
 *  - status: 'disconnected' | 'connecting' | 'connected' | 'error'
 *  - sessionId: string — unique session ID assigned by the server
 *  - messages: array of chat/bid messages
 *  - viewerCount: number
 *  - auctionEnded: bool — true when AUCTION_ENDED is received
 *  - sendMessage(message): send a CHAT_MESSAGE
 *  - sendSignal(type, payload): send any raw WS message (used by VideoPlayer)
 *  - setSignalHandler(fn): register a callback for WebRTC signaling messages
 *  - deleteMessage(messageId): ask server to delete a message (seller only)
 *  - muteUser(username, durationMinutes): ask server to mute a user (seller only)
 *  - ws: ref to the raw WebSocket (for advanced use)
 */
export const useWebSocket = (auctionId, username, role = 'viewer', userId = null) => {
    const [status, setStatus] = useState('disconnected');
    const [sessionId, setSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [viewerCount, setViewerCount] = useState(0);
    const [auctionEnded, setAuctionEnded] = useState(false);
    const [endData, setEndData] = useState(null);
    const [serverTimeOffset, setServerTimeOffset] = useState(0);
    const [serverSecondsLeft, setServerSecondsLeft] = useState(null);

    const ws = useRef(null);
    const pingIntervalRef = useRef(null);
    // Holds the VideoPlayer's WebRTC signal handler — avoids the onmessage override race condition
    const signalHandlerRef = useRef(null);

    /**
     * Allow VideoPlayer (or any consumer) to register a handler for WebRTC signaling messages.
     * Only one handler can be registered at a time.
     */
    const setSignalHandler = useCallback((fn) => {
        signalHandlerRef.current = fn;
    }, []);

    useEffect(() => {
        if (!auctionId || !username) return;

        setStatus('connecting');
        setAuctionEnded(false);

        const socket = new WebSocket(WS_URL);
        ws.current = socket;

        socket.onopen = () => {
            console.log('[WS] Connected');
            setStatus('connected');
            socket.send(JSON.stringify({
                type: 'JOIN_ROOM',
                payload: { auctionId, username, role, userId },
            }));

            // Keep-alive ping every 30s to prevent Nginx idle timeout
            if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = setInterval(() => {
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ type: 'PING' }));
                }
            }, 30000);
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                switch (data.type) {
                    // ── Application-level messages handled by the hook ──────────
                    case 'SESSION_INIT':
                        setSessionId(data.payload?.sessionId ?? null);
                        if (data.payload?.serverTime) {
                            setServerTimeOffset(Date.now() - new Date(data.payload.serverTime).getTime());
                        }
                        break;

                    case 'CHAT_MESSAGE':
                    case 'BID_PLACED':
                    case 'SYSTEM':
                    case 'ERROR':
                        setMessages(prev => [...prev, data]);
                        break;

                    case 'NEW_END_TIME':
                        // Re-sync serverTimeOffset using the server timestamp included in this message.
                        if (data.payload?.serverTime) {
                            setServerTimeOffset(Date.now() - new Date(data.payload.serverTime).getTime());
                        }
                        // Set the authoritative secondsLeft from server — all clients get the same integer
                        if (data.payload?.secondsLeft !== undefined) {
                            setServerSecondsLeft(data.payload.secondsLeft);
                        }
                        setMessages(prev => [...prev, data]);
                        break;

                    case 'VIEWER_COUNT':
                        setViewerCount(data.payload?.count ?? 0);
                        break;

                    case 'MESSAGE_DELETED':
                        setMessages(prev => prev.filter(m => m.payload.id !== data.payload.messageId));
                        break;

                    case 'USER_MUTED':
                        if (data.payload.username === username) {
                            setMessages(prev => [...prev, {
                                type: 'SYSTEM',
                                payload: { message: `Has sido silenciado temporalmente por el moderador durante ${data.payload.durationMinutes || 5} minutos.`, timestamp: new Date().toISOString() }
                            }]);
                        }
                        break;

                    case 'AUCTION_ENDED':
                        setAuctionEnded(true);
                        setEndData(data.payload);
                        // Also forward to VideoPlayer so it can clean up WebRTC resources
                        signalHandlerRef.current?.(data);
                        break;

                    case 'SELLER_LEFT':
                        // Let VideoPlayer know the seller disconnected
                        signalHandlerRef.current?.(data);
                        break;

                    // ── WebRTC signaling — forward to VideoPlayer ────────────
                    case 'OFFER':
                    case 'ANSWER':
                    case 'ICE_CANDIDATE':
                    case 'REQUEST_OFFER':
                    case 'SELLER_LIVE':
                        signalHandlerRef.current?.(data);
                        break;

                    case 'PONG':
                        // Server acknowledged our ping — connection alive
                        break;

                    case 'PING':
                        // Server-initiated heartbeat — respond with PONG
                        if (socket.readyState === WebSocket.OPEN) {
                            socket.send(JSON.stringify({ type: 'PONG' }));
                        }
                        break;

                    default:
                        break;
                }
            } catch (err) {
                console.error('[WS] Parse error:', err);
            }
        };

        socket.onclose = () => {
            console.log('[WS] Disconnected');
            setStatus('disconnected');
            if (pingIntervalRef.current) { clearInterval(pingIntervalRef.current); pingIntervalRef.current = null; }
        };

        socket.onerror = (err) => {
            console.error('[WS] Error:', err);
            setStatus('error');
            if (pingIntervalRef.current) { clearInterval(pingIntervalRef.current); pingIntervalRef.current = null; }
        };

        return () => {
            if (pingIntervalRef.current) { clearInterval(pingIntervalRef.current); pingIntervalRef.current = null; }
            socket.close();
        };
    }, [auctionId, username, role, userId]);

    const sendMessage = useCallback((message) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'CHAT_MESSAGE', payload: { message } }));
        }
    }, []);

    const placeBid = useCallback((amount) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'PLACE_BID', payload: { amount, userId } }));
        }
    }, [userId]);

    const sendSignal = useCallback((type, payload) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type, payload }));
        }
    }, []);

    const deleteMessage = useCallback((messageId) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'DELETE_MESSAGE', payload: { messageId } }));
        }
    }, []);

    const muteUser = useCallback((targetUsername, durationMinutes = 5) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'MUTE_USER', payload: { username: targetUsername, durationMinutes } }));
        }
    }, []);

    return {
        status,
        sessionId,
        messages,
        viewerCount,
        auctionEnded,
        endData,
        sendMessage,
        placeBid,
        sendSignal,
        setSignalHandler,
        deleteMessage,
        muteUser,
        ws,
        serverTimeOffset,
        serverSecondsLeft,
    };
};
