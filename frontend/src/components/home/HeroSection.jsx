import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
    return (
        <section className="w-full">
            <div className="relative overflow-hidden rounded-xl bg-surface-dark group cursor-pointer aspect-[21/9] min-h-[360px]">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{
                        backgroundImage: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuAqKfrwfIyO3faaFvtZKSJcQ5dTY3WOZ6EUMRkIbxTd00tjiJXkVOe_oyiAfHDBN9E1F6wiXbXScRIcXBelfnGyk49PnWFUbNALO0lidp_91RpnXZDx9wM7d9ryUzx3Pl6Sp9HfUTjIHHr-gC9LyJsjQFVBnCdriionIudkLYoQQQ1TlCHo8EzAreQrNEal2OE7mGEUJeiwksUsPapYXu5Oivgytqf-jZYtNglxmJuQ-6cUDR32rbmmt9p6emt6DPiZwNFmJ9lAfoJz')"
                    }}
                ></div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                    <div className="flex flex-col gap-4 max-w-2xl">
                        <div className="flex items-center gap-3">
                            <span className="bg-primary text-[10px] font-bold px-2 py-1 rounded text-white flex items-center gap-1 live-pulse uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 bg-white rounded-full"></span> Live
                            </span>
                            <span className="text-white/80 text-sm font-medium flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
                                <span className="material-symbols-outlined text-sm">visibility</span> 4.5k viewers
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
                            Exclusive Sneaker Drop: <span className="text-primary">Air Jordan 1 'Chicago'</span>
                        </h1>

                        <p className="text-white/70 text-base md:text-lg">
                            Hosted by <span className="text-white font-semibold">@SneakerHead_OG</span> • Current Bid: <span className="text-white font-bold">$1,250</span>
                        </p>

                        <div className="flex gap-4 pt-2">
                            <Link to="/auction/video/1" className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined">play_arrow</span> Join Stream
                            </Link>
                            <button className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-lg font-bold border border-white/20 hover:bg-white/20 transition-all">
                                View Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
