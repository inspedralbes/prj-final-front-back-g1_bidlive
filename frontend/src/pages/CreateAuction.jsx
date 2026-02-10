import React from 'react';
import Header from '../components/layout/Header';

const CreateAuction = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-white font-display">
            <Header />
            <main className="max-w-[800px] mx-auto px-6 py-12">
                <h1 className="text-3xl font-black mb-2">Create New Auction</h1>
                <p className="text-slate-500 mb-8">Fill in the details to list your item for live bidding.</p>

                <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-border-dark p-8 shadow-lg">
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-white">Item Title</label>
                                <input type="text" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 focus:ring-primary focus:border-primary" placeholder="e.g. 1969 Ford Mustang" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-white">Category</label>
                                <select className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 focus:ring-primary focus:border-primary">
                                    <option>Select Category</option>
                                    <option>Collectibles</option>
                                    <option>Watches</option>
                                    <option>Sneakers</option>
                                    <option>Art</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-white">Description</label>
                            <textarea className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 h-32 focus:ring-primary focus:border-primary" placeholder="Describe condition, provenance, and key features..."></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-white">Starting Price ($)</label>
                                <input type="number" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 focus:ring-primary focus:border-primary" placeholder="0.00" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-white">Reserve Price ($)</label>
                                <input type="number" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 focus:ring-primary focus:border-primary" placeholder="Optional" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-white">Duration</label>
                                <select className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 focus:ring-primary focus:border-primary">
                                    <option>1 Hour</option>
                                    <option>24 Hours</option>
                                    <option>3 Days</option>
                                    <option>7 Days</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200 dark:border-border-dark flex items-center justify-end gap-4">
                            <button type="button" className="px-6 py-3 font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Save Draft</button>
                            <button type="button" className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                                Launch Auction
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default CreateAuction;
