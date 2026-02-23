import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useWebSocket } from '../../hooks/useWebSocket';

const ChatSidebar = ({ messages, sendMessage, placeBid, auctionData, currentUsername }) => {
    const [inputMessage, setInputMessage] = useState('');
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'history'
    const [customBidMode, setCustomBidMode] = useState(false);
    const [customBidAmount, setCustomBidAmount] = useState('');
    const scrollRef = useRef(null);
    const { t } = useLanguage();

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, activeTab]);

    const handleSend = (e) => {
        e.preventDefault();
        if (inputMessage.trim()) {
            sendMessage(inputMessage);
            setInputMessage('');
        }
    };

    const handleBid = (amount) => {
        placeBid(amount);
        setCustomBidMode(false);
        setCustomBidAmount('');
    };

    const handleCustomBidSubmit = (e) => {
        e.preventDefault();
        const amount = parseFloat(customBidAmount);
        if (amount && amount >= minNextBid) {
            handleBid(amount);
        } else {
            alert(`${t('auction.minBidAlert')} €${minNextBid}`);
        }
    };

    const currentPrice = auctionData?.currentPrice || 0;
    const minNextBid = currentPrice + 10;

    // Filter messages for history
    const bidHistory = messages.filter(msg => msg.type === 'BID_PLACED').reverse();

    return (
        <aside className="lg:col-span-4 flex flex-col h-full border-l border-[#39282b] bg-[#1a0d0f] text-white overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-[#39282b]">
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'chat' ? 'text-primary border-b-2 border-primary' : 'text-[#ba9ca1] hover:text-white'}`}
                >
                    {t('auction.liveChat')}
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'history' ? 'text-primary border-b-2 border-primary' : 'text-[#ba9ca1] hover:text-white'}`}
                >
                    {t('auction.bidHistory')}
                </button>
            </div>

            {/* Scrollable Feed */}
            <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
                {activeTab === 'chat' ? (
                    <>
                        <div className="flex flex-col items-center py-2">
                            <div className="text-[10px] bg-white/5 px-3 py-1 rounded-full text-[#ba9ca1]">{t('auction.welcome')}</div>
                        </div>
                        {messages.map((msg, index) => {
                            const isSystem = msg.type === 'SYSTEM' || msg.type === 'BID_PLACED';
                            if (isSystem) {
                                return (
                                    <div key={index} className="flex flex-col items-center py-1">
                                        <div className="text-[10px] bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/20">
                                            {msg.type === 'BID_PLACED'
                                                ? `${msg.payload.username || 'Someone'} bid €${msg.payload.amount}`
                                                : (msg.payload.message || 'System Message')}
                                        </div>
                                    </div>
                                );
                            }
                            return (
                                <div key={index} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${msg.payload.username === currentUsername ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}>
                                        {(msg.payload.username || 'AN').substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-xs font-bold ${msg.payload.username === currentUsername ? 'text-primary' : 'text-gray-400'}`}>
                                            {msg.payload.username || 'Anonymous'}
                                        </span>
                                        <p className="text-sm text-white/90 break-words">{msg.payload.message}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                ) : (
                    <div className="space-y-3">
                        {bidHistory.length === 0 && <p className="text-center text-sm text-[#ba9ca1] py-4">{t('auction.noBids')}</p>}
                        {bidHistory.map((msg, index) => (
                            <div key={index} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                                        {(msg.payload.username || 'AN').substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{msg.payload.username || 'Anonymous'}</p>
                                        <p className="text-[10px] text-[#ba9ca1]">{new Date(msg.timestamp || Date.now()).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                                <p className="text-base font-bold text-[#0bda92]">€{msg.payload.amount}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Sticky Bid Controls */}
            <div className="p-4 bg-[#221013] border-t border-[#39282b] space-y-4 shadow-[0_-10px_20px_rgba(0,0,0,0.3)]">
                {/* Chat Input */}
                {activeTab === 'chat' && (
                    <form onSubmit={handleSend} className="flex gap-2">
                        <div className="flex-1 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/40 text-lg">chat_bubble</span>
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder={t('auction.sendMessagePlaceholder')}
                                className="w-full bg-[#39282b] border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary/50 text-white placeholder:text-white/30"
                            />
                        </div>
                        <button type="button" className="bg-[#39282b] w-10 h-10 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-[#4a3539]">
                            <span className="material-symbols-outlined">emoji_emotions</span>
                        </button>
                    </form>
                )}

                <div className="flex flex-col gap-3 pt-2">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">{t('auction.nextMinBid')}: €{minNextBid}</span>
                        <span className="text-[11px] text-primary font-bold">{auctionData.highestBidder ? `${t('auction.heldBy')} ${auctionData.highestBidder}` : t('auction.noBids')}</span>
                    </div>

                    {!customBidMode ? (
                        <>
                            <button
                                onClick={() => handleBid(currentPrice + 10)}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-xl shadow-lg shadow-primary/20 transform active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-0.5"
                            >
                                <span className="text-xl tracking-tight">{t('auction.bid')} +€10</span>
                                <span className="text-[10px] opacity-80 uppercase tracking-widest font-bold">{t('auction.placeBid')}</span>
                            </button>
                            <div className="flex gap-2">
                                <button onClick={() => handleBid(currentPrice + 50)} className="flex-1 py-2 bg-[#39282b] rounded-lg text-xs font-bold hover:bg-[#4a3539] transition-colors border border-white/5 text-white">+€50</button>
                                <button onClick={() => handleBid(currentPrice + 100)} className="flex-1 py-2 bg-[#39282b] rounded-lg text-xs font-bold hover:bg-[#4a3539] transition-colors border border-white/5 text-white">+€100</button>
                                <button onClick={() => setCustomBidMode(true)} className="flex-1 py-2 bg-[#39282b] rounded-lg text-xs font-bold hover:bg-[#4a3539] transition-colors border border-white/5 text-white">{t('auction.custom')}</button>
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleCustomBidSubmit} className="flex gap-2 animate-in fade-in slide-in-from-bottom-2">
                            <input
                                type="number"
                                value={customBidAmount}
                                onChange={(e) => setCustomBidAmount(e.target.value)}
                                placeholder={`Min €${minNextBid}`}
                                className="flex-1 bg-[#39282b] border border-white/10 rounded-lg px-4 text-white font-bold"
                                autoFocus
                            />
                            <button type="submit" className="px-6 bg-primary font-bold text-white rounded-lg">{t('auction.bid')}</button>
                            <button type="button" onClick={() => setCustomBidMode(false)} className="px-3 bg-white/10 rounded-lg text-white">✕</button>
                        </form>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default ChatSidebar;
