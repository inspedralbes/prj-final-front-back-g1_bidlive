import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const { t, toggleLanguage, language } = useLanguage();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-border-dark px-6 md:px-10 lg:px-20 py-3">
            <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4 md:gap-8">
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined text-3xl font-bold">gavel</span>
                        <h2 className="text-xl font-black tracking-tight dark:text-white">BidLive</h2>
                    </Link>
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/explore?status=live" className="text-sm font-semibold hover:text-primary transition-colors dark:text-white/80">{t('nav.live')}</Link>
                        <Link to="/explore?status=upcoming" className="text-sm font-semibold hover:text-primary transition-colors dark:text-white/80">{t('nav.upcoming')}</Link>
                        <Link to="/auctioneers" className="text-sm font-semibold hover:text-primary transition-colors dark:text-white/80">{t('nav.auctioneers')}</Link>
                    </div>
                </div>

                <div className="flex-1 max-w-md hidden lg:block">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const q = e.target.search.value;
                        navigate(`/explore?q=${q}`);
                    }} className="relative group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary">search</span>
                        <input
                            type="text"
                            name="search"
                            placeholder={t('nav.searchPlaceholder')}
                            className="w-full bg-gray-100 dark:bg-surface-dark border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-500 text-slate-900 dark:text-white"
                        />
                    </form>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleLanguage}
                        className="text-sm font-bold text-slate-600 dark:text-gray-300 hover:text-primary transition-colors uppercase border border-slate-200 dark:border-white/10 rounded px-2 py-1"
                    >
                        {language === 'en' ? 'ES' : 'EN'}
                    </button>

                    <Link to="/create-puja" className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-transform active:scale-95">
                        <span className="material-symbols-outlined text-sm">videocam</span>
                        <span className="hidden sm:inline">{t('nav.goLive')}</span>
                    </Link>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-surface-dark rounded-lg relative text-slate-700 dark:text-white">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background-dark"></span>
                    </button>

                    {/* User Menu */}
                    <div className="relative">
                        <div
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-orange-400 border-2 border-white dark:border-border-dark cursor-pointer shadow-lg hover:scale-105 transition-transform"
                        ></div>

                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#271b1d] rounded-xl shadow-xl border border-gray-100 dark:border-[#39282b] overflow-hidden z-50">
                                <div className="px-4 py-3 border-b border-gray-100 dark:border-[#39282b]">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.username || 'User'}</p>
                                    <p className="text-xs text-gray-500 dark:text-[#ba9ca1] truncate">{user?.email || 'email@example.com'}</p>
                                </div>
                                <div className="py-1">
                                    <Link
                                        to="/profile"
                                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#39282b]"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {t('nav.profile')}
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-[#39282b]/50"
                                    >
                                        {t('nav.logout')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
