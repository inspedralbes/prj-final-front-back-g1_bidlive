import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ViewerHeader from "../components/layout/ViewerHeader";
import VideoPlayer from "../components/auction/VideoPlayer";
import ChatSidebar from "../components/auction/ChatSidebar";

const SellerLiveVideo = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-white overflow-hidden h-screen flex flex-col">
      <ViewerHeader />

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT: VIDEO (SELLER) */}
        <div className="lg:col-span-8 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark">
          <div className="px-6 pt-4 flex items-center justify-between">
            <div className="text-lg font-bold">Seller Live · {id}</div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/seller")}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15"
              >
                Back to dashboard
              </button>

              <button
                onClick={() => navigate("/seller")}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 font-bold"
              >
                End Live
              </button>
            </div>
          </div>

          <div className="px-6 pt-4">
            <VideoPlayer auctionId={id} role="seller" autoStart />
          </div>

          <div className="px-6 py-4">
            <div className="bg-black/30 border border-white/10 rounded-xl p-4">
              <div className="font-bold mb-1">Controls del venedor</div>
              <div className="text-sm opacity-80">
                Aquí hi posarem: preu actual, botó “acceptar puja”, pause, canviar item, etc.
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: CHAT */}
        <div className="lg:col-span-4 h-full overflow-hidden">
          <ChatSidebar />
        </div>
      </main>
    </div>
  );
};

export default SellerLiveVideo;
