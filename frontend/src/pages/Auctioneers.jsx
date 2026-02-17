import React from 'react';
import Header from '../components/layout/Header';
import { useLanguage } from '../context/LanguageContext';

const Auctioneers = () => {
    const { t } = useLanguage();

    const auctioneers = [
        { id: 1, name: 'VintageVault', rating: 4.9, items: 124 },
        { id: 2, name: 'Heritage Auctions', rating: 4.8, items: 85 },
        { id: 3, name: 'Sotheby\'s Digital', rating: 5.0, items: 42 },
        { id: 4, name: 'Goldman Classics', rating: 4.7, items: 63 },
    ];

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-white font-display">
            <Header />
            <main className="max-w-6xl mx-auto px-6 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black mb-4">{t('auctioneers.title')}</h1>
                    <p className="text-slate-500 text-xl max-w-2xl mx-auto">{t('auctioneers.subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {auctioneers.map((auctioneer) => (
                        <div key={auctioneer.id} className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark p-6 hover:-translate-y-2 transition-transform duration-300 shadow-lg hover:shadow-xl group cursor-pointer">
                            <div className="h-20 w-20 mx-auto rounded-full bg-slate-100 dark:bg-white/5 mb-4 overflow-hidden relative">
                                <img
                                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${auctioneer.name}`}
                                    alt={auctioneer.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="text-lg font-bold text-center mb-1 group-hover:text-primary transition-colors">{auctioneer.name}</h3>
                            <div className="flex justify-center items-center gap-1 text-amber-400 mb-4">
                                <span className="material-symbols-outlined text-sm">star</span>
                                <span className="text-slate-700 dark:text-white font-bold text-sm">{auctioneer.rating}</span>
                            </div>
                            <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center text-sm">
                                <span className="text-slate-500">Active Items</span>
                                <span className="font-bold">{auctioneer.items}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default Auctioneers;
