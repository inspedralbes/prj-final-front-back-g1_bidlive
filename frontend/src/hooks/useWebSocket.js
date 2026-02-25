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
 *  - placeBid(amount): send a PLACE_BID
 *  - sendSignal(type, payload): send any raw WS message (used by VideoPlayer)
 *  - setSignalHandler(fn): register a callback for WebRTC signaling messages
 *  - ws: ref to the raw WebSocket (for advanced use)
 */
export const useWebSocket = (auctionId, username, role = 'viewer') => {
    const [status, setStatus] = useState('disconnected');
    const [sessionId, setSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [viewerCount, setViewerCount] = useState(0);
    const [auctionEnded, setAuctionEnded] = useState(false);

    const ws = useRef(null);
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
                payload: { auctionId, username, role },
            }));
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                switch (data.type) {
                    // ── Application-level messages handled by the hook ──────────
                    case 'SESSION_INIT':
                        setSessionId(data.payload?.sessionId ?? null);
                        break;

                    case 'CHAT_MESSAGE':
                    case 'BID_PLACED':
                    case 'SYSTEM':
                        setMessages(prev => [...prev, data]);
                        break;

                    case 'VIEWER_COUNT':
                        setViewerCount(data.payload?.count ?? 0);
                        break;

                    case 'AUCTION_ENDED':
                        setAuctionEnded(true);
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
                        signalHandlerRef.current?.(data);
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
        };

        socket.onerror = (err) => {
            console.error('[WS] Error:', err);
            setStatus('error');
        };

        return () => {
            socket.close();
        };
    }, [auctionId, username, role]);

    const sendMessage = useCallback((message) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'CHAT_MESSAGE', payload: { message } }));
        }
    }, []);

    const placeBid = useCallback((amount) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'PLACE_BID', payload: { amount } }));
        }
    }, []);

    const sendSignal = useCallback((type, payload) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type, payload }));
        }
    }, []);

    return {
        status,
        sessionId,
        messages,
        viewerCount,
        auctionEnded,
        sendMessage,
        placeBid,
        sendSignal,
        setSignalHandler,
        ws,
    };
};
