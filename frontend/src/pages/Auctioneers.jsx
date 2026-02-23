import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

const Auctioneers = () => {
    const { t } = useLanguage();
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getTopSellers()
            .then(data => {
                setSellers(data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-white font-display">
            <Header />
            <main className="max-w-6xl mx-auto px-6 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black mb-4">{t('auctioneers.title')}</h1>
                    <p className="text-slate-500 text-xl max-w-2xl mx-auto">{t('auctioneers.subtitle')}</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                ) : sellers.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">
                        <span className="material-symbols-outlined text-5xl mb-3">person_search</span>
                        <p className="text-lg font-medium">No sellers found yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {sellers.map((seller, i) => (
                            <div key={i} className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark p-6 hover:-translate-y-2 transition-transform duration-300 shadow-lg hover:shadow-xl group cursor-pointer">
                                <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-tr from-primary to-orange-400 mb-4 flex items-center justify-center text-2xl font-bold text-white">
                                    {seller.name.charAt(0).toUpperCase()}
                                </div>
                                <h3 className="text-lg font-bold text-center mb-4 group-hover:text-primary transition-colors">{seller.name}</h3>
                                <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Active Items</span>
                                    <span className="font-bold">{seller.items}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Auctioneers;
