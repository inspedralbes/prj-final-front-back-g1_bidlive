import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';

import ViewerHeader from '../components/layout/ViewerHeader';
import Footer from '../components/layout/Footer';
import PhotoGallery from '../components/auction/photo/PhotoGallery';
import ProductHeader from '../components/auction/photo/ProductHeader';
import ChatSidebar from '../components/auction/ChatSidebar';
import ItemDescription from '../components/auction/ItemDescription';
import SellerInfo from '../components/auction/SellerInfo';

const LiveAuctionPhoto = () => {
    const { id: auctionId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Configurar usuario (o invitado)
    const username = user ? user.username || user.email.split('@')[0] : `Guest_${Math.floor(Math.random() * 1000)}`;
    const userId = user ? user.id : null;

    // WebSocket Connection
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/bidding/';
    const { messages, sendMessage, placeBid, endAuction, auctionData } = useWebSocket(wsUrl, auctionId, username, userId);

    const isSeller = user && auctionData?.sellerId && String(user.id) === String(auctionData.sellerId);
    const isEnded = auctionData?.status === 'ended';

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white h-screen flex flex-col relative overflow-hidden">
            <ViewerHeader />

            {/* Winner Overlay */}
            {isEnded && (
                <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
                    <div className="bg-[#221013] border border-primary/30 p-10 rounded-3xl max-w-2xl w-full text-center shadow-[0_0_50px_rgba(235,0,41,0.2)]">
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-2 uppercase tracking-tighter">Auction Ended</h2>
                        <div className="text-primary text-xl font-bold tracking-widest uppercase mb-8">Winner Declared</div>

                        <div className="flex flex-col gap-6 items-center">
                            <div className="size-24 rounded-full bg-primary flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-primary/40">
                                {(auctionData.winner || 'N/A').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-[#ba9ca1] text-sm font-bold uppercase tracking-widest mb-1">Winning Bidder</p>
                                <p className="text-3xl font-bold text-white">{auctionData.winner || 'No Bids'}</p>
                            </div>
                            <div className="h-px w-full bg-white/10"></div>
                            <div>
                                <p className="text-[#ba9ca1] text-sm font-bold uppercase tracking-widest mb-1">Final Price</p>
                                <p className="text-6xl font-black text-[#0bda92] tracking-tight">€{auctionData.finalPrice || auctionData.currentPrice}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => window.location.href = '/'}
                            className="mt-10 px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-all"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            )}

            <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
                {/* Left Section: Gallery & Stats (8 Columns) */}
                <section className="lg:col-span-8 flex flex-col h-full overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-[#181112]">
                    <div className="flex flex-wrap gap-2 px-6 py-4 items-center">
                        <a href="/" className="text-slate-400 dark:text-[#ba9ca1] text-sm font-medium">Home</a>
                        <span className="text-slate-400 dark:text-[#ba9ca1] text-sm">/</span>
                        <a href="/explore" className="text-slate-400 dark:text-[#ba9ca1] text-sm font-medium">Explore</a>
                        <span className="text-slate-400 dark:text-[#ba9ca1] text-sm">/</span>
                        <span className="text-slate-900 dark:text-white text-sm font-medium truncate max-w-[200px]">{auctionData?.title || 'Loading...'}</span>
                    </div>

                    <PhotoGallery auctionData={auctionData} />

                    <div className="relative">
                        <ProductHeader auctionData={auctionData} />
                        {isSeller && !isEnded && (
                            <button
                                onClick={endAuction}
                                className="absolute right-6 top-0 z-40 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-red-600/20 transform hover:scale-105 transition-all flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined">stop_circle</span>
                                End Auction
                            </button>
                        )}
                    </div>

                    <div className="p-6 space-y-6">
                        <SellerInfo auctionData={auctionData} />
                        <ItemDescription auctionData={auctionData} />
                    </div>
                </section>

                {/* Right Section: Interactive Auction Panel (4 Columns) */}
                <ChatSidebar
                    messages={messages}
                    sendMessage={sendMessage}
                    placeBid={placeBid}
                    auctionData={auctionData}
                    currentUsername={username}
                />
            </main>
        </div>
    );
};

export default LiveAuctionPhoto;
