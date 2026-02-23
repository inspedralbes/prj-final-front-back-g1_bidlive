import { useState, useEffect, useRef, useCallback } from 'react';

export const useWebSocket = (url, auctionId, username, userId) => {
    const [status, setStatus] = useState('disconnected'); // disconnected, connecting, connected, error
    const [messages, setMessages] = useState([]);
    const [auctionData, setAuctionData] = useState({ currentPrice: 0, highestBidder: null }); // New state for auction data
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
                payload: { auctionId, username, userId }
            }));
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'AUCTION_UPDATE') {
                    setAuctionData(prev => ({
                        ...prev,
                        currentPrice: data.payload.currentPrice,
                        highestBidder: data.payload.lastBidder || prev.highestBidder,
                        sellerId: data.payload.sellerId || prev.sellerId
                    }));
                    // Add system message if provided
                    if (data.payload.message) {
                        setMessages(prev => [...prev, { type: 'SYSTEM', payload: { message: data.payload.message } }]);
                    }
                } else if (data.type === 'AUCTION_ENDED') {
                    setAuctionData(prev => ({
                        ...prev,
                        currentPrice: data.payload.finalPrice,
                        highestBidder: data.payload.winner,
                        status: 'ended', // Mark as ended
                        winner: data.payload.winner, // Explicit winner field
                        finalPrice: data.payload.finalPrice
                    }));
                    setMessages(prev => [...prev, { type: 'SYSTEM', payload: { message: data.payload.message } }]);
                } else if (data.type === 'ERROR') {
                    console.error('WebSocket Error Message:', data.payload.message);
                    setMessages(prev => [...prev, { type: 'SYSTEM', payload: { message: `Error: ${data.payload.message}` } }]);
                } else {
                    setMessages(prev => [...prev, data]);
                }

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
    }, [url, auctionId, username, userId]);

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

    const endAuction = useCallback(() => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                type: 'END_AUCTION',
                payload: {}
            }));
        }
    }, []);

    return { status, messages, sendMessage, placeBid, endAuction, auctionData };
};
