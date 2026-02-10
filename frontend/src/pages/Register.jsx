import React from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-white min-h-screen">
            <div className="layout-container flex h-full grow flex-col">
                {/* Top Navigation */}
                <header className="flex items-center justify-between border-b border-solid border-[#39282b] px-10 py-3 bg-background-light dark:bg-background-dark">
                    <Link to="/" className="flex items-center gap-4 text-white">
                        <div className="size-6 text-primary">
                            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
                            </svg>
                        </div>
                        <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">LiveAuction</h2>
                    </Link>
                    <div className="flex flex-1 justify-end gap-8">
                        <div className="flex items-center gap-9">
                            <Link to="/" className="text-white/80 hover:text-white text-sm font-medium leading-normal">Home</Link>
                            <Link to="/explore" className="text-white/80 hover:text-white text-sm font-medium leading-normal">Browse</Link>
                            <Link to="/explore" className="text-white/80 hover:text-white text-sm font-medium leading-normal">Live</Link>
                        </div>
                        <Link to="/login" className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal">
                            <span>Login</span>
                        </Link>
                    </div>
                </header>

                <main className="flex-1 flex flex-col items-center justify-center py-12 px-4">
                    <div className="max-w-[480px] w-full flex flex-col gap-2">
                        {/* Headline */}
                        <h1 className="text-white tracking-light text-[32px] font-bold leading-tight text-center pb-2 pt-6">Join the Auction</h1>
                        <p className="text-[#ba9ca1] text-center mb-6">Create an account to start bidding and streaming.</p>

                        {/* Registration Form */}
                        <form className="flex flex-col gap-4">
                            {/* Full Name */}
                            <div className="flex flex-col gap-2">
                                <label className="flex flex-col w-full">
                                    <p className="text-white text-sm font-medium leading-normal pb-1">Full Name</p>
                                    <input className="form-input flex w-full rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#543b3f] bg-[#271b1d] h-12 placeholder:text-[#ba9ca1] px-4 text-base font-normal leading-normal" placeholder="Enter your full name" type="text" />
                                </label>
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-2">
                                <label className="flex flex-col w-full">
                                    <p className="text-white text-sm font-medium leading-normal pb-1">Email Address</p>
                                    <input className="form-input flex w-full rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#543b3f] bg-[#271b1d] h-12 placeholder:text-[#ba9ca1] px-4 text-base font-normal leading-normal" placeholder="name@example.com" type="email" />
                                </label>
                            </div>

                            {/* Password */}
                            <div className="flex flex-col gap-2">
                                <label className="flex flex-col w-full">
                                    <p className="text-white text-sm font-medium leading-normal pb-1">Password</p>
                                    <div className="relative flex items-center">
                                        <input className="form-input flex w-full rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#543b3f] bg-[#271b1d] h-12 placeholder:text-[#ba9ca1] px-4 pr-12 text-base font-normal leading-normal" placeholder="Create a password" type="password" />
                                        <span className="material-symbols-outlined absolute right-4 text-[#ba9ca1] cursor-pointer">visibility</span>
                                    </div>
                                </label>
                            </div>

                            {/* Confirm Password */}
                            <div className="flex flex-col gap-2">
                                <label className="flex flex-col w-full">
                                    <p className="text-white text-sm font-medium leading-normal pb-1">Confirm Password</p>
                                    <div className="relative flex items-center">
                                        <input className="form-input flex w-full rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#543b3f] bg-[#271b1d] h-12 placeholder:text-[#ba9ca1] px-4 pr-12 text-base font-normal leading-normal" placeholder="Repeat your password" type="password" />
                                        <span className="material-symbols-outlined absolute right-4 text-[#ba9ca1] cursor-pointer">visibility</span>
                                    </div>
                                </label>
                            </div>

                            {/* Terms and Conditions */}
                            <div className="flex items-center gap-3 py-2">
                                <input className="w-5 h-5 rounded border-[#543b3f] bg-[#271b1d] text-primary focus:ring-primary focus:ring-offset-background-dark" id="terms" type="checkbox" />
                                <label className="text-sm text-[#ba9ca1] leading-tight" htmlFor="terms">
                                    I agree to the <a className="text-primary hover:underline" href="#">Terms of Service</a> and <a className="text-primary hover:underline" href="#">Privacy Policy</a>
                                </label>
                            </div>

                            {/* Action Button */}
                            <button className="flex w-full cursor-pointer items-center justify-center rounded-xl h-14 px-4 bg-primary text-white text-base font-bold leading-normal shadow-lg hover:bg-primary/90 transition-colors" type="submit">
                                Sign Up
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative flex items-center py-6">
                            <div className="flex-grow border-t border-[#39282b]"></div>
                            <span className="flex-shrink mx-4 text-sm text-[#ba9ca1]">Or register with</span>
                            <div className="flex-grow border-t border-[#39282b]"></div>
                        </div>

                        {/* Social Registration */}
                        <div className="flex gap-4">
                            <button className="flex-1 flex items-center justify-center gap-3 h-12 rounded-lg border border-[#543b3f] bg-[#271b1d] hover:bg-[#39282b] transition-colors">
                                <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKDd7pAUUDZW9Wkte_YX0MhnFeoxrHtwadoh378Jc5sw1Q7O4FDI_PlPWD_NyiJi2c6kS5QBCZV9J-kJ862NRSJ9_fdGReteGPym0L0_CldcsLckPcbOcKhZ6JEATlEpV6OqhVVip75wSkyZk7jX0A-ygfMjf3iQpP86ZP0zc918zZ0LVAj27CCinRMNGPIDbVwCzO677e7ShaQU2VpPEOi5pAp5HG50ITc0UwwPJu_kDmv7108iFfM_Ky7jFqyTt2Am5MjyY1bYHO" />
                                <span className="text-sm font-medium">Google</span>
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-3 h-12 rounded-lg border border-[#543b3f] bg-[#271b1d] hover:bg-[#39282b] transition-colors">
                                <span className="material-symbols-outlined text-white">brand_awareness</span>
                                <span className="text-sm font-medium">Apple</span>
                            </button>
                        </div>

                        {/* Footer link */}
                        <p className="text-center text-[#ba9ca1] text-sm mt-8">
                            Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Login</Link>
                        </p>
                    </div>
                </main>

                {/* Background Decoration */}
                <div className="fixed top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full opacity-50"></div>
                <div className="fixed bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full opacity-30"></div>
            </div>
        </div>
    );
};

export default Register;
