import React, { useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';

import ViewerHeader from '../components/layout/ViewerHeader';
import VideoPlayer from '../components/auction/VideoPlayer';
import SellerInfo from '../components/auction/SellerInfo';
import BiddingHUD from '../components/auction/BiddingHUD';
import ItemDescription from '../components/auction/ItemDescription';
import ChatSidebar from '../components/auction/ChatSidebar';

const LiveAuctionSellerVideo = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleExit = () => {
    // torna al dashboard de venedor
    navigate('/seller', { replace: true });
  };
  useEffect(() => {
  const onBeforeUnload = (e) => {
    e.preventDefault();
    e.returnValue = '';
  };
  window.addEventListener('beforeunload', onBeforeUnload);
  return () => window.removeEventListener('beforeunload', onBeforeUnload);
}, []);


  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-white overflow-hidden h-screen flex flex-col">
      <ViewerHeader />

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left: Stream & Details (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col h-full overflow-y-auto custom-scrollbar bg-background-light dark:bg-background-dark">
          <VideoPlayer auctionId={id} role="seller" autoStart />

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-sm opacity-80">
                Mode venedor · Live ID: <span className="font-mono">{id}</span>
              </div>

              <button
                onClick={handleExit}
                className="px-3 py-2 rounded-lg bg-black/30 hover:bg-black/40 border border-white/10"
              >
                Sortir
              </button>
            </div>

            {/* si aquests components accepten props, perfecte; si no, no passa res */}
            <SellerInfo auctionId={id} />
            <BiddingHUD auctionId={id} />
            <ItemDescription auctionId={id} />
          </div>
        </div>

        {/* Right: chat */}
        <ChatSidebar auctionId={id} role="seller" />
      </main>
    </div>
  );
};

export default LiveAuctionSellerVideo;
