import React from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-white min-h-screen flex flex-col">
            <div className="layout-container flex h-full grow flex-col">
                {/* Top Navigation Bar */}
                <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-primary/20 px-10 py-3 bg-background-light dark:bg-background-dark">
                    <Link to="/" className="flex items-center gap-4 text-primary dark:text-white">
                        <div className="size-6">
                            <span className="material-symbols-outlined text-[32px]">gavel</span>
                        </div>
                        <h2 className="text-primary dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">LiveAuction</h2>
                    </Link>
                    <div className="flex flex-1 justify-end gap-8">
                        <div className="hidden md:flex items-center gap-9">
                            <Link to="/explore" className="text-zinc-600 dark:text-white text-sm font-medium leading-normal hover:text-primary transition-colors">Auctions</Link>
                            <Link to="/explore" className="text-zinc-600 dark:text-white text-sm font-medium leading-normal hover:text-primary transition-colors">Live Streams</Link>
                            <Link to="/seller" className="text-zinc-600 dark:text-white text-sm font-medium leading-normal hover:text-primary transition-colors">Sell</Link>
                            <Link to="#" className="text-zinc-600 dark:text-white text-sm font-medium leading-normal hover:text-primary transition-colors">Help</Link>
                        </div>
                        <Link to="/login" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em]">
                            <span className="truncate">Login</span>
                        </Link>
                    </div>
                </header>

                <main className="flex-1 flex items-center justify-center py-12 px-4">
                    <div className="layout-content-container flex flex-col max-w-[480px] w-full bg-white dark:bg-[#2d161a] p-8 rounded-xl shadow-2xl border border-zinc-200 dark:border-primary/10">
                        {/* Icon and Heading */}
                        <div className="flex flex-col items-center">
                            <div className="mb-4 bg-primary/10 p-4 rounded-full">
                                <span className="material-symbols-outlined text-primary text-4xl">lock_reset</span>
                            </div>
                            <h1 className="text-zinc-900 dark:text-white tracking-tight text-[32px] font-bold leading-tight text-center pb-3">Reset Password</h1>
                        </div>

                        {/* Instructional Text */}
                        <p className="text-zinc-600 dark:text-zinc-300 text-base font-normal leading-normal pb-6 pt-1 text-center">
                            Enter your email address below and we'll send you a link to reset your password and regain access to your account.
                        </p>

                        {/* Input Field */}
                        <div className="flex flex-col gap-4 py-3">
                            <label className="flex flex-col w-full">
                                <p className="text-zinc-800 dark:text-white text-base font-medium leading-normal pb-2">Email Address</p>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">mail</span>
                                    <input className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-zinc-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary border border-zinc-300 dark:border-[#543b3f] bg-zinc-50 dark:bg-[#271b1d] h-14 placeholder:text-zinc-400 dark:placeholder:text-[#ba9ca1] pl-12 pr-4 text-base font-normal leading-normal transition-all" placeholder="Enter your email address" type="email" />
                                </div>
                            </label>
                        </div>

                        {/* Primary Action Button */}
                        <div className="flex py-6">
                            <button className="flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 flex-1 bg-primary hover:bg-primary/90 text-white text-base font-bold leading-normal tracking-[0.015em] shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                                <span className="truncate">Send Reset Link</span>
                            </button>
                        </div>

                        {/* Navigation Link */}
                        <div className="flex flex-col items-center pt-2">
                            <Link to="/login" className="group flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-primary dark:hover:text-primary transition-colors font-medium">
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </main>

                {/* Footer for context */}
                <footer className="py-8 text-center text-zinc-500 dark:text-zinc-500 text-sm">
                    <p>© 2024 LiveAuction Inc. Secure Bidding & Streaming.</p>
                </footer>
            </div>
        </div>
    );
};

export default ForgotPassword;
