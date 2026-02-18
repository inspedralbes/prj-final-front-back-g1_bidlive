import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../hooks/useWebSocket';

const ChatSidebar = () => {
    const { id: auctionId } = useParams();
    const { user } = useAuth();
    const [inputMessage, setInputMessage] = useState('');
    const scrollRef = useRef(null);

    // Use a default username if not logged in (or handle as guest)
    const username = user ? user.username || user.email.split('@')[0] : `Guest_${Math.floor(Math.random() * 1000)}`;

    // Connect to WebSocket
    // Note: In production, the WS URL should be an env variable
    const wsUrl = 'ws://localhost:8080/bidding/';
    const { messages, sendMessage, placeBid } = useWebSocket(wsUrl, auctionId, username);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (inputMessage.trim()) {
            sendMessage(inputMessage);
            setInputMessage('');
        }
    };

    const handleBid = (amount) => {
        placeBid(amount);
    };

    return (
        <aside className="lg:col-span-4 flex flex-col h-full border-l border-[#39282b] bg-[#1a0d0f] text-white overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-[#39282b]">
                <button className="flex-1 py-4 text-xs font-bold uppercase tracking-widest text-primary border-b-2 border-primary">Live Chat</button>
                <button className="flex-1 py-4 text-xs font-bold uppercase tracking-widest text-[#ba9ca1] hover:text-white transition-colors">Bid History</button>
            </div>

            {/* Scrollable Feed */}
            <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
                {/* System Message */}
                <div className="flex flex-col items-center py-2">
                    <div className="text-[10px] bg-white/5 px-3 py-1 rounded-full text-[#ba9ca1]">Welcome to the Live Auction</div>
                </div>

                {/* Map over real messages */}
                {messages.map((msg, index) => {
                    const isSystem = msg.type === 'SYSTEM' || msg.type === 'BID_PLACED';

                    if (isSystem) {
                        return (
                            <div key={index} className="flex flex-col items-center py-1">
                                <div className="text-[10px] bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/20">
                                    {msg.type === 'BID_PLACED'
                                        ? `${msg.payload.username} bid €${msg.payload.amount}`
                                        : msg.payload.message}
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={index} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${msg.payload.username === username ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}>
                                {msg.payload.username.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-xs font-bold ${msg.payload.username === username ? 'text-primary' : 'text-gray-400'}`}>
                                    {msg.payload.username}
                                </span>
                                <p className="text-sm text-white/90 break-words">{msg.payload.message}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Sticky Bid Controls */}
            <div className="p-4 bg-[#221013] border-t border-[#39282b] space-y-4 shadow-[0_-10px_20px_rgba(0,0,0,0.3)]">
                <form onSubmit={handleSend} className="flex gap-2">
                    <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/40 text-lg">chat_bubble</span>
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Send a message..."
                            className="w-full bg-[#39282b] border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary/50 text-white placeholder:text-white/30"
                        />
                    </div>
                    <button type="button" className="bg-[#39282b] w-10 h-10 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-[#4a3539]">
                        <span className="material-symbols-outlined">emoji_emotions</span>
                    </button>
                </form>

                <div className="flex flex-col gap-3 pt-2">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">Next minimum bid: €1,460</span>
                        <span className="text-[11px] text-primary font-bold">TOP BIDDER</span>
                    </div>
                    <button
                        onClick={() => handleBid(10)}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-xl shadow-lg shadow-primary/20 transform active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-0.5"
                    >
                        <span className="text-xl tracking-tight">BID +€10</span>
                        <span className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Place bid now</span>
                    </button>
                    <div className="flex gap-2">
                        <button onClick={() => handleBid(50)} className="flex-1 py-2 bg-[#39282b] rounded-lg text-xs font-bold hover:bg-[#4a3539] transition-colors border border-white/5 text-white">+€50</button>
                        <button onClick={() => handleBid(100)} className="flex-1 py-2 bg-[#39282b] rounded-lg text-xs font-bold hover:bg-[#4a3539] transition-colors border border-white/5 text-white">+€100</button>
                        <button className="flex-1 py-2 bg-[#39282b] rounded-lg text-xs font-bold hover:bg-[#4a3539] transition-colors border border-white/5 text-white">Custom</button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default ChatSidebar;
