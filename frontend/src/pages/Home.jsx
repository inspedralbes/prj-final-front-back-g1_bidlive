import React from 'react';
import Header from '../components/layout/Header';
import HeroSection from '../components/home/HeroSection';
import ActiveListings from '../components/home/ActiveListings';

const Home = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-white font-display pb-20">
            <Header />
            <main className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20 py-8 space-y-12">
                <HeroSection />
                <ActiveListings />
            </main>
        </div>
    );
};

export default Home;
