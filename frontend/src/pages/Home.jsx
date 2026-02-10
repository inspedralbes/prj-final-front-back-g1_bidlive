import React from 'react';
import Header from '../components/layout/Header';
import HeroSection from '../components/home/HeroSection';
import AuctioneerRail from '../components/home/AuctioneerRail';
import LiveGrid from '../components/home/LiveGrid';
import CategoryRail from '../components/home/CategoryRail';
import ActiveListings from '../components/home/ActiveListings';
import UpcomingRail from '../components/home/UpcomingRail';
import LiveTicker from '../components/home/LiveTicker';

const Home = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-white font-display pb-20">
            <Header />
            <main className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20 py-8 space-y-12">
                <HeroSection />
                <AuctioneerRail />
                <LiveGrid />
                <CategoryRail />
                <ActiveListings />
                <UpcomingRail />
            </main>
            <LiveTicker />
        </div>
    );
};

export default Home;
