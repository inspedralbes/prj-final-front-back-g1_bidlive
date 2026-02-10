import React from 'react';
import ViewerHeader from '../components/layout/ViewerHeader';
import VideoPlayer from '../components/auction/VideoPlayer';
import SellerInfo from '../components/auction/SellerInfo';
import BiddingHUD from '../components/auction/BiddingHUD';
import ItemDescription from '../components/auction/ItemDescription';
import ChatSidebar from '../components/auction/ChatSidebar';

const LiveAuctionVideo = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-white overflow-hidden h-screen flex flex-col">
            <ViewerHeader />
            <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
                {/* Left: Stream & Details (8 Columns) */}
                <div className="lg:col-span-8 flex flex-col h-full overflow-y-auto custom-scrollbar bg-background-light dark:bg-background-dark">
                    <VideoPlayer />
                    <div className="p-6 space-y-6">
                        <SellerInfo />
                        <BiddingHUD />
                        <ItemDescription />
                    </div>
                </div>
                {/* Right: Real-time Feed & Bidding Controls (4 Columns) */}
                <ChatSidebar />
            </main>
        </div>
    );
};

export default LiveAuctionVideo;
