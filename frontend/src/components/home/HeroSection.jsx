import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function HeroSection() {
    const { t } = useLanguage();
    return (
        <section className="relative py-16 md:py-24 overflow-hidden">
            {/* Background glows */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-15"
                    style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-10"
                    style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }} />
            </div>

            <div className="relative z-10 text-center max-w-4xl mx-auto">
                <div className="badge-live inline-flex mx-auto mb-6">
                    <span className="live-dot" />
                    {t('home.liveBadge')}
                </div>

                <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight text-white mb-6">
                    {t('home.heroTitle1')}
                    <span className="relative inline-block">
                        <span className="text-amber-400">{t('home.heroTitle2')}</span>
                        <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 200 6" preserveAspectRatio="none">
                            <path d="M0 5 Q50 0 100 5 Q150 10 200 5" stroke="#f59e0b" strokeWidth="2" fill="none" opacity="0.5" />
                        </svg>
                    </span>
                </h1>

                <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
                    {t('home.heroSubtitle')}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link to="/explore" className="btn-explore-premium">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                        Explore auctions
                    </Link>
                    <Link to="/create-puja"
                        className="btn-ghost text-base px-8 py-3.5">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
                        {t('home.sellBtn')}
                    </Link>
                </div>

                {/* Stats bar */}
                <div className="flex justify-center gap-8 sm:gap-16 mt-14 pt-10 border-t border-white/5">
                    {[
                        { val: '12K+', label: t('home.stats.total') },
                        { val: '500+', label: t('home.stats.live') },
                        { val: '$2.4M', label: t('home.stats.traded') },
                        { val: '98%', label: t('home.stats.satisfaction') },
                    ].map(({ val, label }) => (
                        <div key={label} className="text-center">
                            <p className="text-2xl font-black text-white">{val}</p>
                            <p className="text-xs text-gray-500 mt-1">{label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
