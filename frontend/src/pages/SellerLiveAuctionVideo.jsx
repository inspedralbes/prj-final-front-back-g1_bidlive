import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoPlayer from "../components/auction/VideoPlayer";
import ChatSidebar from "../components/auction/ChatSidebar";

const SellerLiveAuctionVideo = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-white overflow-hidden h-screen flex flex-col">
      {/* Header seller */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-white/10">
        <div className="font-black tracking-tight">Seller Live • {id}</div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15"
            onClick={() => navigate("/seller")}
          >
            Back to dashboard
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 font-bold"
            onClick={() => {
              // TODO: cridar backend "end live"
              navigate("/seller");
            }}
          >
            End Live
          </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left */}
        <div className="lg:col-span-8 flex flex-col h-full overflow-y-auto custom-scrollbar bg-background-light dark:bg-background-dark">
          <VideoPlayer auctionId={id} role="seller" />
          <div className="p-6 space-y-4">
            <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
              <div className="font-bold">Controls del venedor</div>
              <div className="text-white/70 text-sm">
                Aquí hi posarem: preu actual, botó “acceptar puja”, “pause”, “canviar item”, etc.
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-4 h-full overflow-hidden border-l border-white/10">
          <ChatSidebar />
        </div>
      </main>
    </div>
  );
};

export default SellerLiveAuctionVideo;
