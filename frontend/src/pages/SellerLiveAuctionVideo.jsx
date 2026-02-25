import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWebSocket } from "../hooks/useWebSocket";
import VideoPlayer from "../components/auction/VideoPlayer";
import ChatSidebar from "../components/auction/ChatSidebar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

/**
 * Seller live page.
 * Creates ONE WebSocket connection and shares it with both VideoPlayer and ChatSidebar.
 * This prevents the double-connection bug that confused room.seller in the bidding-service.
 */
const SellerLiveAuctionVideo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const username = user?.username || user?.email || "Anonymous";

  const [isEnding, setIsEnding] = React.useState(false);
  const [endError, setEndError] = React.useState(null);

  // Single shared WebSocket — passed to both VideoPlayer and ChatSidebar
  const wsHook = useWebSocket(id, username, "seller");
  const { sendSignal, messages, sendMessage, status } = wsHook;

  const handleEndLive = async () => {
    if (isEnding) return;
    setIsEnding(true);
    setEndError(null);

    try {
      const response = await fetch(`${API_URL}/auction/pujas/${id}/end`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      let body = null;
      try { body = await response.json(); } catch (_) { }

      if (!response.ok) {
        setEndError(body?.message || `Error ${response.status}`);
        setIsEnding(false);
        return;
      }

      console.log("[EndLive] Auction ended in DB ✓", body);

      // Broadcast AUCTION_ENDED to all viewers via WebSocket
      sendSignal("END_AUCTION", { auctionId: id });

      // Navigate after WS message flushes
      // Wait a beat so the WS END_AUCTION message flushes, then navigate once (controlled path).
      setTimeout(() => navigate("/seller"), 600);
    } catch (error) {
      console.error("[EndLive] Error:", error);
      setEndError("Error de conexión.");
      setIsEnding(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-white overflow-hidden h-screen flex flex-col">
      <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
        <div className="font-black tracking-tight">Seller Live • {id}</div>
        <div className="flex items-center gap-3">
          {endError && (
            <span className="text-red-400 text-xs font-medium bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-lg">
              {endError}
            </span>
          )}
          <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm" onClick={() => navigate("/seller")}>
            Back
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 font-bold text-sm disabled:opacity-50"
            onClick={handleEndLive}
            disabled={isEnding}
          >
            {isEnding ? "Ending..." : "End Live"}
          </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        <div className="lg:col-span-8 flex flex-col h-full overflow-y-auto custom-scrollbar">
          {/*
                     * Pass externalWs so VideoPlayer uses THIS connection
                     * instead of creating a second seller WS.
                     */}
          <VideoPlayer
            auctionId={id}
            role="seller"
            externalWs={wsHook}
          // Do NOT pass onAuctionEnd here — navigation is controlled exclusively
          // by the setTimeout in handleEndLive to avoid a race condition with
          // the AUCTION_ENDED echo that the seller receives from the WS server.
          />
          <div className="p-6">
            <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
              <div className="font-bold text-sm">Controls del vendedor</div>
              <div className="text-white/50 text-xs mt-1">Preu actual, pause, canviar item…</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 h-full overflow-hidden border-l border-white/10">
          <ChatSidebar
            auctionId={id}
            role="seller"
            externalMessages={messages}
            externalSend={sendMessage}
            externalStatus={status}
          />
        </div>
      </main>
    </div>
  );
};

export default SellerLiveAuctionVideo;
