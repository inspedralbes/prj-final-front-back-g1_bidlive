import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark text-white min-h-screen font-display">
            <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
                <div className="layout-container flex h-full grow flex-col">
                    {/* Top Navigation Bar */}
                    <div className="px-4 flex justify-center py-5">
                        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-primary/20 px-4 md:px-10 py-3">
                                <Link to="/" className="flex items-center gap-4 text-white">
                                    <div className="size-6 text-primary">
                                        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
                                        </svg>
                                    </div>
                                    <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Auction Live</h2>
                                </Link>
                                <div className="flex flex-1 justify-end gap-8">
                                    <div className="hidden md:flex items-center gap-9">
                                        <Link to="/explore" className="text-white text-sm font-medium leading-normal hover:text-primary transition-colors">Live Auctions</Link>
                                        <Link to="/explore" className="text-white text-sm font-medium leading-normal hover:text-primary transition-colors">Upcoming</Link>
                                    </div>
                                    <Link to="/register" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors">
                                        <span className="truncate">Sign Up</span>
                                    </Link>
                                </div>
                            </header>
                        </div>
                    </div>

                    {/* Login Content Area */}
                    <div className="flex flex-1 justify-center items-center py-10 px-4">
                        <div className="layout-content-container flex flex-col w-full max-w-[480px] bg-[#271b1d]/40 p-8 rounded-xl border border-[#39282b]">
                            {/* Headline & Body */}
                            <div className="mb-2">
                                <h1 className="text-white tracking-light text-[32px] font-bold leading-tight text-center">Welcome back!</h1>
                                <p className="text-white/70 text-base font-normal leading-normal pt-2 text-center">Login to start bidding in real-time auctions</p>
                            </div>

                            {/* Form Section */}
                            <form className="flex flex-col gap-2 mt-6">
                                {/* Email Field */}
                                <div className="flex flex-col w-full py-2">
                                    <label className="flex flex-col w-full">
                                        <p className="text-white text-sm font-medium leading-normal pb-2">Email</p>
                                        <input className="form-input flex w-full min-w-0 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#543b3f] bg-[#271b1d] h-14 placeholder:text-[#ba9ca1] p-[15px] text-base font-normal" placeholder="Enter your email" type="email" />
                                    </label>
                                </div>

                                {/* Password Field */}
                                <div className="flex flex-col w-full py-2">
                                    <label className="flex flex-col w-full">
                                        <div className="flex justify-between items-center pb-2">
                                            <p className="text-white text-sm font-medium leading-normal">Password</p>
                                            <Link to="/forgot-password" className="text-primary text-xs font-medium hover:underline">Forgot Password?</Link>
                                        </div>
                                        <div className="flex w-full flex-1 items-stretch rounded-lg">
                                            <input className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#543b3f] bg-[#271b1d] h-14 placeholder:text-[#ba9ca1] p-[15px] rounded-r-none border-r-0 pr-2 text-base font-normal" placeholder="Enter your password" type="password" />
                                            <div className="text-[#ba9ca1] flex border border-[#543b3f] bg-[#271b1d] items-center justify-center px-4 rounded-r-lg border-l-0 cursor-pointer hover:text-white transition-colors">
                                                <span className="material-symbols-outlined text-[24px]">visibility</span>
                                            </div>
                                        </div>
                                    </label>
                                </div>

                                {/* Login Button */}
                                <div className="pt-4">
                                    <button className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-4 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-all shadow-lg shadow-primary/20" type="submit">
                                        <span>Login</span>
                                    </button>
                                </div>
                            </form>

                            {/* Divider */}
                            <div className="flex items-center gap-4 my-8">
                                <div className="h-[1px] flex-1 bg-[#39282b]"></div>
                                <span className="text-[#ba9ca1] text-xs font-medium uppercase tracking-wider">Or continue with</span>
                                <div className="h-[1px] flex-1 bg-[#39282b]"></div>
                            </div>

                            {/* Social Logins */}
                            <div className="flex flex-col gap-3">
                                <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#543b3f] bg-[#271b1d] h-12 px-4 text-white hover:bg-[#39282b] transition-colors">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"></path>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"></path>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="currentColor"></path>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"></path>
                                    </svg>
                                    <span className="text-sm font-medium">Google</span>
                                </button>
                                <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#543b3f] bg-[#271b1d] h-12 px-4 text-white hover:bg-[#39282b] transition-colors">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M17.05 20.28c-.96.95-2.21 1.72-3.72 1.72-1.52 0-2.49-.47-3.62-.47-1.13 0-2.3.47-3.53.47-2.15 0-4.37-1.89-4.37-5.55 0-3.32 1.95-5.23 3.86-5.23.95 0 1.83.47 2.82.47 1.01 0 1.54-.47 2.81-.47 1.48 0 2.76.71 3.53 1.83-3.15 1.48-2.65 5.8 0 6.94-.3.8-.82 1.48-1.48 2.29M12.03 7.25c-.02-2.13 1.6-4.08 3.55-4.14.23 2.37-1.93 4.3-3.55 4.14z" fill="currentColor"></path>
                                    </svg>
                                    <span className="text-sm font-medium">Apple</span>
                                </button>
                            </div>

                            {/* Footer Link */}
                            <div className="mt-8 text-center">
                                <p className="text-[#ba9ca1] text-sm">
                                    Don't have an account?
                                    <Link to="/register" className="text-primary font-bold hover:underline ml-1">Create an account</Link>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Decorative Element */}
                    <div className="h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-20 w-full mt-auto"></div>
                </div>
            </div>
        </div>
    );
};

export default Login;
