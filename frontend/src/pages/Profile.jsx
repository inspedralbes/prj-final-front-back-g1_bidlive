import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

const Profile = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [myAuctions, setMyAuctions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserAuctions = async () => {
            if (!user) return;
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/auction/pujas/user/${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setMyAuctions(data);
                }
            } catch (error) {
                console.error("Error fetching user auctions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserAuctions();
    }, [user]);

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-white font-display">
            <Header />
            <main className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* User Info Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-border-dark p-8 shadow-lg text-center sticky top-24">
                            <div className="h-32 w-32 mx-auto rounded-full bg-gradient-to-tr from-primary to-orange-400 border-4 border-white dark:border-border-dark flex items-center justify-center text-4xl font-bold text-white shadow-xl mb-6">
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <h1 className="text-2xl font-black mb-1">{user?.username}</h1>
                            <p className="text-slate-500 mb-6">{user?.email}</p>

                            <button className="w-full py-2.5 border border-slate-200 dark:border-white/10 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors mb-4">
                                {t('profile.edit')}
                            </button>

                            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-100 dark:border-border-dark">
                                <div>
                                    <h3 className="text-2xl font-black text-primary">{myAuctions.length}</h3>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Auctions</p>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-400">0</h3>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bids</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">gavel</span>
                                My Auctions
                            </h2>

                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : myAuctions.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {myAuctions.map(auction => (
                                        <Link to={`/auction/photo/${auction.id}`} key={auction.id} className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark overflow-hidden hover:shadow-lg transition-all group flex flex-col">
                                            <div className="h-40 bg-slate-200 relative overflow-hidden">
                                                {auction.image_url && (
                                                    <img src={auction.image_url} alt={auction.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                )}
                                                <div className="absolute top-2 right-2">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${auction.status === 'live' ? 'bg-primary text-white' :
                                                        auction.status === 'upcoming' ? 'bg-amber-500 text-white' : 'bg-slate-500 text-white'
                                                        }`}>
                                                        {auction.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-4 flex-1 flex flex-col">
                                                <h3 className="font-bold text-lg mb-1 line-clamp-1">{auction.title}</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">{auction.description}</p>
                                                <div className="flex justify-between items-end border-t border-slate-100 dark:border-border-dark pt-3">
                                                    <div>
                                                        <p className="text-xs text-slate-500 font-bold uppercase">Price</p>
                                                        <p className="font-black text-lg">${auction.current_price || auction.starting_price}</p>
                                                    </div>
                                                    <span className="text-xs font-bold text-primary hover:underline">View Details</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-surface-dark rounded-xl border-2 border-dashed border-slate-200 dark:border-border-dark p-12 text-center">
                                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">storefront</span>
                                    <p className="text-slate-500 font-medium mb-4">You haven't created any auctions yet.</p>
                                    <Link to="/create-puja" className="inline-block px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors">
                                        Create Your First Auction
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
