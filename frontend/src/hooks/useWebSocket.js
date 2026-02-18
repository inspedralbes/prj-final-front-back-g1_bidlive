import { useState, useEffect, useRef, useCallback } from 'react';

export const useWebSocket = (url, auctionId, username) => {
    const [status, setStatus] = useState('disconnected'); // disconnected, connecting, connected, error
    const [messages, setMessages] = useState([]);
    const ws = useRef(null);

    useEffect(() => {
        if (!url || !auctionId || !username) return;

        setStatus('connecting');
        const socket = new WebSocket(url);
        ws.current = socket;

        socket.onopen = () => {
            console.log('WebSocket Connected');
            setStatus('connected');

            // Join Room
            socket.send(JSON.stringify({
                type: 'JOIN_ROOM',
                payload: { auctionId, username }
            }));
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setMessages(prev => [...prev, data]);
            } catch (error) {
                console.error('Error parsing WS message:', error);
            }
        };

        socket.onclose = () => {
            console.log('WebSocket Disconnected');
            setStatus('disconnected');
        };

        socket.onerror = (error) => {
            console.error('WebSocket Error:', error);
            setStatus('error');
        };

        return () => {
            socket.close();
        };
    }, [url, auctionId, username]);

    const sendMessage = useCallback((message) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                type: 'CHAT_MESSAGE',
                payload: { message }
            }));
        }
    }, []);

    const placeBid = useCallback((amount) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                type: 'PLACE_BID',
                payload: { amount }
            }));
        }
    }, []);

    return { status, messages, sendMessage, placeBid };
};
