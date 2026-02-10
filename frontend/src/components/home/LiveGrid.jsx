import React from 'react';
import { Link } from 'react-router-dom';

const LiveGrid = () => {
    const liveItems = [
        {
            id: 2,
            title: "PSA 10 Charizard Holo 1st Edition Auction",
            seller: "CardCollector_LA",
            category: "Collectibles",
            bid: "$4,500",
            viewers: "1.2k",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDi2xxCqA-xYv1ZvEObF2Ds0pC2yWVE_AUZgw72l_dua_UVkprGUXpYPjFiCli5cxq6E2Wq6LKyPQAvMEqqFJQh64-l7xXLtJowpL_-C8OMsQZQOgvrT7MsTMEjiKbokxxJ-x2XaUsFIo1fIpmVvTeGc7FoGKRllMv5D_4ucYJGgRoWNz6Lsnp4yDsJxcRnPKVR1g0M2keNLpOdxdRtxyre4_UlAvt6EbpGr7QO2ULZwHSqit3oAGwoCHqtvqan7f3EVWa0urdFlLDt",
            sellerImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuCC4Wdyi_xleRFGLl2RKgIn9_BXDjnfEKpRLKxQ7wtUr63u07eayofw9GVcxTAr1Th91_T5CUJLqUWbxzy52wGmOWy8syg0LD_AdN9FYJPjPJ_gtbyKMGe5AY5zS_rt3aVfTNIHfjJc9qbfm-zhcJIAKop6m34qUlt5H4JJHlzSyxwgy2iSh1gr5GMH-ZFwEfbtUScVo1v6ghawkMrNAQak8gPSQKctmyajwyjMg3rxsFUfqbi4ybl55G4-YqP3G-LuSsonHdP2gdTM"
        },
        {
            id: 3,
            title: "Rolex Submariner Estate Sale - No Reserve",
            seller: "TimepieceTraders",
            category: "Luxury",
            bid: "$9,200",
            viewers: "854",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCDPFKcudGHUPd8pmpcElm0J4ExIlfQeZ8yxoEXkg_yU4UVk8Ae_TLfzzlRrsvHVm0Te4DNJoS1Z9HT26n3ikBQST58nNiB4JXUTBBItF2XxiZVEl8eXzBMJIIYddLaZz4S24QlClBaexCdRAJO4RJapktBwbCmXPR3K1n8MiiGly1_Xo2FJXIGvRgWKNmRKNRJACcCkhTLwdlked_9r6HCvjWr9tqGDcEBPMcjeMGT-xROv4ziJaXETCeHfm-MvFGTHaod2vU_51D8",
            sellerImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxnY2xLp9eSmX_OvNR4LiKiE5UlOXQBzqnaVtyHbNWWLtSfkWj2NUDU1FwQGKo9fKdWlQ4hy2qQMDPcDtkDt_tyc6eyjZ_J8kTWOiccbWfOm3yUDpZbdzfvTJpJ5IGlTF6IkbYNEKMpB9z2iM7KO6ymHYRTaMd2bukg6ySPkLSApGddv21gIDV0bn6eRnbe-lG0dZQmNdmkzjQMfkiTCfks1SUb-qMtw-wi5NFe1PhCWwQsojryuzu2VvevIPtfJO9TUjfDB9zhHXR"
        },
        {
            id: 4,
            title: "Factory Sealed Gameboy Color Collection",
            seller: "RetroGamerGuy",
            category: "Tech",
            bid: "$1,400",
            viewers: "430",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBer8soklFmNJ0DFnUQJMtXVGOeCpOuJOtNkhQOEzBzDKzHnKeO-0daQj6CiTfej5zKnl9lCAwwf9UZoCdH7LVodnkUfE5iFEhkBfL00ZcJvOuacTBu_ACOnvRJ5naWbPWHsNuylZEIQVy52Xu0HJXRT6ccy4BC2dipvUWwbKniXvxJ2nMaolQrAeS8mbM_JVXj9DnrMnAsCr7xRLyoDmFez2KVCOmB32aPLPyujXAGfMZvlNO4SA9a-GiPhWgf-LlDOfcKoLHn8zBL",
            sellerImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_xIRbqqIj-5w7ZqCBwS0dds-X1LmCLC22WRg1429JOc0dxy7AoM-jnZATYOA0unKPbYevw5QigspufQzSthnvdanEJCdaQ2JpDH-iGpEj0i07hcAhA0987pTsERSWYq0TKJL8vuUJFo10ORnJWm4LZBe3HtnMPQZ4W-ImnH0cBP1pDdsY8itFz18U5BX6FZSD_djIwa9xr5H7g3AUPQEAaQSIyBYZBV-2m9pfzehqbPd_P2vqfHkK9TuhvnGqlkP27vzXi7hLwn_I"
        },
        {
            id: 5,
            title: "Contemporary Art: 'Neon Pulse' Original",
            seller: "GalleryModern",
            category: "Art",
            bid: "$5,800",
            viewers: "2.1k",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC21QOn9pI9OSwVA99kclkh5zugnG8EZNG32-dMrzX5uMX3z9eGtlii-szZVwWJBwvEJ0tPG4p-XzIeH_Eh-P5DVBh1In4JTS9uBF1G82tPSB5ifYUEGQGRpkM_LKejdek4EMeKY12e8oMDSsYO8SF9u7l8-V04_h-VQugpDEO90ZJOzBDtVKFHkTtKXpVEGKfQF4A2fd970RSIseis6ErT5F_DHN2ucbbnAkIVvqzjsJZcaefQpIfTFmSBgqhkhh4yd32hgMOVaZAl",
            sellerImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuBTqy7RPvLlEIAHv-JAI2JZeSByTk0JAHoL9yliDOTLw_JTQbxiEX1SL0s8ocbMPJMysjZYMBF4Nz5mDjgSDy2EssH7aHRCj7MBn90ysGcaRbjOPrDSBc8umwWSdv39-MYTkbSdvgZ9XNvhI7e6BpMSNEHbJP3nM0OT3j76_HESj5mftdgGBESAo-8GlAeIByBOS-nWVARBorF01DfX46rwPy0k6wvPmOrUQF8LweysW-Ea9uNHtYZfN2k_V5iqi2pO9JcaL1Uzw_68"
        }
    ];

    return (
        <section>
            <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">live_tv</span> Live Streams
                </h2>
                <div className="flex items-center gap-4">
                    <button className="text-xs font-bold bg-white dark:bg-surface-dark px-3 py-1.5 rounded-lg border border-gray-200 dark:border-border-dark">Filter: Most Viewers</button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {liveItems.map(item => (
                    <Link to={`/auction/video/${item.id}`} key={item.id} className="flex flex-col gap-3 group">
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-surface-dark shadow-2xl">
                            <div
                                className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                                style={{ backgroundImage: `url('${item.img}')` }}
                            ></div>
                            <div className="absolute top-2 left-2 flex gap-1">
                                <span className="bg-primary text-[10px] font-bold px-1.5 py-0.5 rounded text-white live-pulse">LIVE</span>
                                <span className="bg-black/60 text-[10px] font-bold px-1.5 py-0.5 rounded text-white flex items-center gap-0.5 backdrop-blur-md">
                                    <span className="material-symbols-outlined text-[12px]">visibility</span> {item.viewers}
                                </span>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button className="bg-primary text-white p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                    <span className="material-symbols-outlined text-3xl">play_arrow</span>
                                </button>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-start gap-3">
                                <div
                                    className="w-10 h-10 rounded-full bg-cover bg-center border border-border-dark"
                                    style={{ backgroundImage: `url('${item.sellerImg}')` }}
                                ></div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.seller}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="bg-gray-100 dark:bg-surface-dark px-2 py-0.5 rounded text-[10px] font-semibold">{item.category}</span>
                                        <span className="text-primary text-[10px] font-black tracking-wider uppercase">Bid: {item.bid}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default LiveGrid;
