import React from 'react';
import { Link } from 'react-router-dom';

const ResultsGrid = () => {
    const auctions = [
        {
            id: 201,
            title: "1967 Ferrari 275 GTB/4",
            subtitle: "Maranello Classics • Series II",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAZfScdZusUSyuVid14wSAu5sUjdsrHv6068ZCQFUK4ir8Il2OC7Tb2x7ZbCSjzUejHv_2pZOIrKlrz8RXVsyuH7s2Ou-wqisFG0Qtz3Wkz1WJi8Ucs0JIDlVlRcFHlrX_F8urOsRHFIdloQgAgNk5XPV7ZUEcwWr9fKfOLPJmAZxtX3jZ7OL6wY3vc3ko6PDzlJ5pLyRMemdpk0e72HZLcGbMFtILDkRrBEPtVkmEKtQBq9UV-oRt1oVK6EnGxvb4oEC38CnEhf8SU",
            currentBid: "$3,450,000",
            bids: 12,
            secondaryInfo: "04m 12s",
            isLive: true,
            isHdStream: true
        },
        {
            id: 202,
            title: "Patek Philippe Nautilus 5711",
            subtitle: "Luxury Horology • New Boxed",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBoLSaX3rgbVqPug7hPJRQi00kw7ywL0XRbuaSdMqvb64JKAqQ3KauyzsNL4RCl-43JR7QaA0hjOKOBgQ6AyikrlKzJ3414lAHv6JLmj_TfC85wTOxKa1bL8JlIIaZgkR5wpXGAgzi8mCPqUuGHc-TqATSM3BieS0-cSArk1uDW2Te-uMo_s2fW5oFXF_qhR-iV07EH6WA04KHRpdljxxiN1JuewRUwiam_rs1d2aAncmBKzNDVcZNJjciya02HiXZfUXr7KuhD35um",
            currentBid: "$120,000",
            secondaryInfo: "Starts in 15m",
            isStartingSoon: true
        },
        {
            id: 203,
            title: "Nike Mag 'Back to the Future'",
            subtitle: "Sneaker Grail • Size 10 US",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAPkPYVZgBKPejUPAs5qrGiJMXnt4_Sf534sKbWt-Ljy1ll3JfbPvXe8_DTgcHZGObwONIR2S23BvktN_Q3908L7N_L-v2KE-0F_QyOiGGHYxzxR0YR0P0HSCZYbBWlY5qfyveQ4Qo-ji7KXCZ6Se1OAGVA3hgytB5UXpFjmJFX8zJwky3IWdlXv9-L36oJ9JcrqAteoXR6-McFCgcafy0i2S_V-iywnaWid4eAOuuNXQvneI-_5i2AQPK-JL4pZUh2BB2hEdrf5YUZ",
            currentBid: "$64,200",
            bids: 48,
            timeLeft: "00:42",
            isEndingSoon: true
        },
        {
            id: 204,
            title: "Ethereal Fragments No. 4",
            subtitle: "Fine Art Collective • Signed",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDjQq3qe2tRV0YZQ1bhIee3it8Kk-AS6fu0nI8vg-0FGoKjqgysEWOZo_Zc20KFWf3gkbDqiVzl3Qicu46VqywIntRzY6ZM5J-EPOMmZkM6Ni7hWr5a6XvPDtq4uFLajlKt8ehpFRUJ8BOGiYZLiWcsPWuG-FMJAtR9NhuH2Oggyj17vbECqbr5B5ECbA6rS96IsyfVS7Zl7YnhYj_mT2VRazWNBaYrgXnXC65dDYWUdUw-OQ0ZcTGqxGFAaM4puixWEyjb91p-Pp2O",
            currentBid: "$8,500",
            bids: 5,
            secondaryInfo: "1h 22m",
            isLive: true
        },
        {
            id: 205,
            title: "Leica M3 Single Stroke",
            subtitle: "Vintage Gear • Mint Condition",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZ9LCgygOfIEUFpjGuRxtqhb4sqBd_eimxR8R_VOY23zgZ68VSvkF3S8imo-5jWcN6ZH2W9MM6Ec0JF43O3sMC0mhIaq0KRr0AKMIDl1SSOvbM8DsD-5J57ttRK4LceXQ8qbZnpLyrOfrv6JIQufeRggTt7PktVG_4m_fjHNTvg5iJQvHf8kZz5smoJcJL6nElVCJhYF1431kc12KpELmMuYlXd1zwwbK5E3C0SBecQEBWHZSsk9PEuhWi3aPqX--ToAe4FB2OYJ9m",
            currentBid: "$4,200",
            bids: 21,
            secondaryInfo: "02m 45s",
            isLive: true
        },
        {
            id: 206,
            title: "X-Shore Eelex 8000",
            subtitle: "Eco Marine • Demo Unit",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCwYQ-Ca1eYQXqkR5X8ns98w8z2J5bMQq27wIkaQBWEsyL42muitMzwUj-b45xGpDmzQxAWNeZpE5oQbmKXAIHm62LMecoWgP9Irq7PXmDp475wPMzaw2ZJ8F3lUJ0c7jmDZsRp4hjeHydi4INH-68WkeVvjThx1AThTFG4UVIwomAAgP0Mr5OO9YDF0J95cd9JyZoVg0z8R4BXy8GWnUX-e8sLdxjXpvGLO_2mFaHX8tyhpB4TuEgvmF3rckaewG_PWgcy7iYYfU92",
            currentBid: "$185,000",
            bids: 7,
            secondaryInfo: "12h 05m",
            isLive: true,
            isHdStream: true
        },
        {
            id: 207,
            title: "Macallan 1926 60-Year-Old",
            subtitle: "Spirits Reserve • Fine & Rare",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA3wkY_J-6QJ67anEkX-WzAOBWuWri8ZxpYRDpTgYSprwAA4ZN7pUe2RFu093hwwbeBsGzrZiOCgltThVsWo2ACunnLbHwC72_Do004dWDRoO5USQp5cB6AQTIhI39aEstNG7fD48v8EN2V4KUwKqAtOlviqNytniC7r6ggJR_OSRa_CcYeCRipRhq9fjBYKF_pnSmLFHXkeTsycnUJeJdLWbphPsAkk5Fkm5UJXxLqOlFOyiPwnaA5gTDGUox0VnxFUOj9mCnmWifC",
            currentBid: "$1,200,000",
            bids: 15,
            secondaryInfo: "45m 20s",
            isLive: true
        },
        {
            id: 208,
            title: "Charizard 1st Edition PSA 10",
            subtitle: "TCG Collectibles • Shadowless",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCtpGxvkUOcxl23CnqDrWyOgS47-jTWflxIvmGKwyIcNQ3OsrgE_0cyixSAQDn3nmPECqy3CbZek0oz-OGBX9-e9jWWu27Gq2Z9dFT2svRTX4S5AIxDSef9jNh36pZTC_C5l-notqa17rIT-T1ZcgP9zMeQmhIdkbZX1qSTa-58FK9K7CqFgljipxLo8J9nnH0NCRE5zdTwiLYIBlE1RcAACrvHWqFEVYBFOnz_jdzYA1f6SNVwOXYnOhC6qP6iqP3Rtkh6u61LKT91",
            currentBid: "$350,000",
            bids: 92,
            secondaryInfo: "Bid Now",
            isEndingSoon: true,
            timeLeft: "02:15"
        }
    ];

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold">248 Results found</h3>
                <div className="flex gap-2">
                    <button className="p-2 rounded bg-primary/10 text-primary">
                        <span className="material-symbols-outlined">grid_view</span>
                    </button>
                    <button className="p-2 rounded text-slate-500">
                        <span className="material-symbols-outlined">view_list</span>
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {auctions.map(item => (
                    <Link to={`/auction/${item.isLive ? 'video' : 'photo'}/${item.id}`} key={item.id} className="group bg-white dark:bg-surface-dark rounded-xl overflow-hidden border border-slate-200 dark:border-border-dark hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/5 cursor-pointer">
                        <div className="relative aspect-[4/3] overflow-hidden">
                            <div
                                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                                style={{ backgroundImage: `url('${item.img}')` }}
                            ></div>

                            {/* Badges */}
                            {item.isLive && (
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 uppercase tracking-wider">
                                        <span className="size-1.5 bg-white rounded-full live-pulse"></span> Live Now
                                    </span>
                                    {item.isHdStream && (
                                        <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 uppercase tracking-wider">
                                            <span className="material-symbols-outlined text-[14px]">videocam</span> HD Stream
                                        </span>
                                    )}
                                </div>
                            )}

                            {item.isStartingSoon && (
                                <div className="absolute top-3 left-3">
                                    <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 uppercase tracking-wider">
                                        <span className="material-symbols-outlined text-[14px]">schedule</span> Starting Soon
                                    </span>
                                </div>
                            )}

                            {item.isEndingSoon && (
                                <div className="absolute top-3 right-3">
                                    <div className="bg-white/90 dark:bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex flex-col items-center">
                                        <span className="text-[10px] font-bold text-primary">ENDING IN</span>
                                        <span className="text-sm font-black text-slate-900 dark:text-white">{item.timeLeft}</span>
                                    </div>
                                </div>
                            )}

                            {item.isLive && (
                                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                                    <div className="bg-black/60 backdrop-blur-md text-white rounded-lg p-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm text-primary">visibility</span>
                                        <span className="text-xs font-bold">1.2k watching</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-lg line-clamp-1">{item.title}</h4>
                                <span className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors">favorite</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{item.subtitle}</p>

                            {item.isEndingSoon ? (
                                <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-3 flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-primary uppercase font-bold tracking-widest">Top Bid</span>
                                        <span className="text-xs text-primary font-bold">{item.bids} Bids</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-2xl font-black text-primary">{item.currentBid}</span>
                                        <button className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg">Bid Now</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-slate-50 dark:bg-surface-dark rounded-xl p-3 flex flex-col gap-2 border border-slate-100 dark:border-border-dark">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">{item.isStartingSoon ? "Starting At" : "Current Bid"}</span>
                                        <span className={`text-xs font-bold ${item.isStartingSoon ? 'text-amber-500' : 'text-primary'}`}>
                                            {item.isStartingSoon ? item.secondaryInfo : `${item.bids} Bids`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className={`text-2xl font-black ${item.isLive ? 'text-primary' : ''}`}>{item.currentBid}</span>
                                        {item.isStartingSoon ? (
                                            <button className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg">Remind Me</button>
                                        ) : (
                                            <span className="text-xs font-bold text-slate-400">{item.secondaryInfo}</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
            <div className="mt-12 flex flex-col items-center gap-4">
                <button className="px-8 py-3 bg-slate-100 dark:bg-surface-dark hover:bg-slate-200 dark:hover:bg-border-dark rounded-xl font-bold transition-colors flex items-center gap-2 border border-slate-200 dark:border-border-dark">
                    <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                    Loading more auctions...
                </button>
                <p className="text-sm text-slate-500">Showing 8 of 248 items</p>
            </div>
        </div>
    );
};

export default ResultsGrid;
