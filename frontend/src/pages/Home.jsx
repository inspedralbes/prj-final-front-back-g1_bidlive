import React from 'react';
import Header from '../components/layout/Header';
import HeroSection from '../components/home/HeroSection';
import LiveGrid from '../components/home/LiveGrid';
import ActiveListings from '../components/home/ActiveListings';

export default function Home() {
    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-16">
                <HeroSection />
                <LiveGrid />
                <ActiveListings />
            </main>
        </div>
    );
}
