import { useState, useEffect, useRef, useCallback } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/bidding/';

/**
 * @param {string} auctionId
 * @param {string} username
 * @param {'seller'|'viewer'} role
 */
export const useWebSocket = (auctionId, username, role = 'viewer') => {
    const [status, setStatus] = useState('disconnected');
    const [messages, setMessages] = useState([]);
    const [viewerCount, setViewerCount] = useState(0);
    const ws = useRef(null);

    useEffect(() => {
        if (!auctionId || !username) return;

        setStatus('connecting');
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
                    case 'CHAT_MESSAGE':
                    case 'BID_PLACED':
                    case 'SYSTEM':
                        setMessages(prev => [...prev, data]);
                        break;
                    case 'VIEWER_COUNT':
                        setViewerCount(data.payload?.count ?? 0);
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

        socket.onerror = () => {
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

    return { status, messages, viewerCount, sendMessage, placeBid, sendSignal, ws };
};
