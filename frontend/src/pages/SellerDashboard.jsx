import React from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/seller/Sidebar';
import StatsGrid from '../components/seller/StatsGrid';
import RecentSalesTable from '../components/seller/RecentSalesTable';
import UpcomingAuctions from '../components/seller/UpcomingAuctions';

const SellerDashboard = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-white font-display">
            <Header />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 lg:ml-64 p-6 md:p-10">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-black">Dashboard</h1>
                            <p className="text-slate-500">Welcome back, VintageVault Auctions</p>
                        </div>
                        <button className="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors">
                            <span className="material-symbols-outlined">add</span>
                            Create Auction
                        </button>
                    </div>

                    <StatsGrid />

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <div className="xl:col-span-2">
                            <RecentSalesTable />
                        </div>
                        <div className="xl:col-span-1">
                            <UpcomingAuctions />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SellerDashboard;
