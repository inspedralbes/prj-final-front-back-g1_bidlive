import React from 'react';
import { Link } from 'react-router-dom';

const TwoFactorAuth = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-white transition-colors duration-300 min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
                <div className="layout-container flex h-full grow flex-col">
                    {/* Navigation Bar */}
                    <div className="px-4 md:px-40 flex justify-center py-5">
                        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#39282b] px-4 md:px-10 py-3">
                                <Link to="/" className="flex items-center gap-4 text-white">
                                    <div className="size-6 text-primary">
                                        <span className="material-symbols-outlined text-3xl">gavel</span>
                                    </div>
                                    <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">LiveAuction</h2>
                                </Link>
                                <div className="flex flex-1 justify-end gap-8">
                                    <div className="hidden md:flex items-center gap-9">
                                        <Link to="/explore" className="text-white/80 hover:text-white text-sm font-medium transition-colors">Auctions</Link>
                                        <Link to="/explore" className="text-white/80 hover:text-white text-sm font-medium transition-colors">Live</Link>
                                        <Link to="#" className="text-white/80 hover:text-white text-sm font-medium transition-colors">Help</Link>
                                    </div>
                                    <Link to="/login" className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors">
                                        <span className="truncate">Sign In</span>
                                    </Link>
                                </div>
                            </header>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <main className="flex-1 flex justify-center items-center py-10">
                        <div className="layout-content-container flex flex-col max-w-[480px] w-full px-6">
                            {/* Shield/Lock Illustration */}
                            <div className="flex justify-center mb-6">
                                <div className="relative flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full">
                                    <span className="material-symbols-outlined text-primary text-6xl">shield_lock</span>
                                    <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary animate-pulse">
                                        <span className="material-symbols-outlined text-white text-xs">priority_high</span>
                                    </div>
                                </div>
                            </div>

                            {/* Headline */}
                            <h2 className="text-white tracking-light text-[28px] font-bold leading-tight text-center pb-3">2FA Verification</h2>

                            {/* Body Text */}
                            <p className="text-white/70 text-base font-normal leading-normal pb-8 text-center">
                                Enter the 6-digit code sent to your phone ending in <span className="text-white font-semibold">•••• 8829</span>
                            </p>

                            {/* OTP Input Container */}
                            <div className="flex justify-center py-6">
                                <fieldset className="relative flex gap-3 md:gap-4">
                                    {[...Array(6)].map((_, i) => (
                                        <input
                                            key={i}
                                            className="flex h-14 w-10 md:w-12 text-center bg-transparent [appearance:textfield] focus:outline-0 focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none border-0 border-b-2 border-[#543b3f] focus:border-primary text-2xl font-bold text-white transition-colors"
                                            max="9"
                                            maxLength="1"
                                            min="0"
                                            type="number"
                                        />
                                    ))}
                                </fieldset>
                            </div>

                            {/* Verify Button */}
                            <div className="mt-8 px-4">
                                <button className="w-full flex h-12 cursor-pointer items-center justify-center rounded-lg bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                                    Verify Identity
                                </button>
                            </div>

                            {/* Resend & Timer */}
                            <div className="mt-8 flex flex-col items-center gap-2">
                                <p className="text-white/50 text-sm">Didn't receive the code?</p>
                                <div className="flex items-center gap-2">
                                    <a className="text-primary text-sm font-semibold hover:underline decoration-primary/50 underline-offset-4 opacity-50 cursor-not-allowed" href="#">Resend Code</a>
                                    <span className="text-white/30">|</span>
                                    <span className="text-white/70 text-sm font-mono">Resend in 00:55</span>
                                </div>
                            </div>
                        </div>
                    </main>

                    {/* Optional Help Footer Section */}
                    <footer className="mt-auto px-4 md:px-40 py-10 flex justify-center">
                        <div className="flex flex-col items-center gap-2 text-white/40 text-xs">
                            <p>© 2024 LiveAuction Inc. All rights reserved.</p>
                            <div className="flex gap-4">
                                <Link className="hover:text-white/60" to="#">Privacy Policy</Link>
                                <Link className="hover:text-white/60" to="#">Terms of Service</Link>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default TwoFactorAuth;
