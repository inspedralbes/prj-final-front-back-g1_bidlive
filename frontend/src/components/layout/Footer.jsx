import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-[#39282b] px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-display">
            <div className="flex items-center gap-6 text-slate-500 dark:text-[#ba9ca1]">
                <p>© 2024 LiveAuction Inc.</p>
                <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-primary transition-colors">Help Center</a>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-slate-500 dark:text-[#ba9ca1]">Secure payments via</span>
                <div className="flex gap-2 opacity-50 grayscale hover:grayscale-0 transition-all text-slate-800 dark:text-white">
                    <span className="material-symbols-outlined text-lg">credit_card</span>
                    <span className="material-symbols-outlined text-lg">account_balance</span>
                    <span className="material-symbols-outlined text-lg">currency_bitcoin</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
