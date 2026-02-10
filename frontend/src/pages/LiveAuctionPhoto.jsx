import React from 'react';
import ViewerHeader from '../components/layout/ViewerHeader';
import Footer from '../components/layout/Footer';
import PhotoGallery from '../components/auction/photo/PhotoGallery';
import ProductHeader from '../components/auction/photo/ProductHeader';
import PhotoSidebar from '../components/auction/photo/PhotoSidebar';

const LiveAuctionPhoto = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen flex flex-col">
            <ViewerHeader />
            <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Left Section: Gallery & Stats (70%) */}
                <section className="flex-1 flex flex-col overflow-y-auto hide-scrollbar bg-slate-50 dark:bg-[#181112]">
                    {/* Breadcrumbs */}
                    <div className="flex flex-wrap gap-2 px-6 py-4 items-center">
                        <a href="#" className="text-slate-400 dark:text-[#ba9ca1] text-sm font-medium">Home</a>
                        <span className="text-slate-400 dark:text-[#ba9ca1] text-sm">/</span>
                        <a href="#" className="text-slate-400 dark:text-[#ba9ca1] text-sm font-medium">Watch Auctions</a>
                        <span className="text-slate-400 dark:text-[#ba9ca1] text-sm">/</span>
                        <span className="text-slate-900 dark:text-white text-sm font-medium">Rare Rolex Daytona 1968</span>
                    </div>

                    <PhotoGallery />
                    <ProductHeader />
                </section>

                {/* Right Section: Interactive Auction Panel (30%) */}
                <PhotoSidebar />
            </main>
            <Footer />
        </div>
    );
};

export default LiveAuctionPhoto;
