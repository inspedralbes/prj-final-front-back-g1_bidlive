import React from 'react';

const AuctioneerRail = () => {
    const auctioneers = [
        { name: 'Alex Rivers', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCztFCXLPhsw210bdXuqcW1Otky-9SVGrZUpvM2HUMae5XUmrskl0EXTKgMJoR9cbH15PlOhi5F8iheNGfy8Y2ZOjMbbsDuV3Oydylim_XRvi_d79gs8cdQ1dwMYZSKAxn005xMSZr-ere0fnLWBJQQWngLXwnCwQ7_fVlLKL9X01M6vz2AuArxqLdpfEmjoTRoQjejpO1OITj6ieV6Q5WJxMNi8jHrvvih0ERqLX37UNnNxBzh8YAnIPgg5tJNJ7BxEH1dnthcwnwc', online: true },
        { name: 'Sarah J.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEY2NVhTysZAxlGHiFmUsqBnq5IW1lQu-vB43zcQVzOS89MRO0y_PNegIj3Ajo7dzchRbOjB6lNUT33XftPKuMU8VhmnViPfotv5oc1m3d10o8E4QgNmAqYVDSuLaDj_DVhXeN6Dyj0Yu0T_9XfUeri6BUebikHaLaH-H7FzYH8ke3kLfeJq497eOkTL-lToKR8POW0gCwy66ms6nkQ2ggfIRCesAy5-RcYMs_aFO4Ujv4X4Ltd1wxGMNzjVDoksgrlJ0xm4Bp2ESP', online: false },
        { name: 'VintageVault', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-4f49gXi_ShRAKiPSu4FRqGgjfEhWKnNOkn4k4qks07p58HUlZ73aSvTnW3PicT6VC0pV1BtcnxxYYPkrqaG5rWKlxjLQVuaL664E1zYqj9kYo368vT0S4Z5DLEkT_IOxYy0-B4FRsV8_mASiV6nTn0oBZsNNDvxs9AvQ1GndRLnrBeHisLtvmQEy45UJlw_V5vkfo-F_qL0XK99IqjjbQ9OEoaRrQlpqZ9PmOFkHqkYRSoScKDsPT8CV4P8TchATsPNTMHedJaTm', online: true },
        { name: 'ArtCurator', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXZfkofr44yzXKTjW78VDKmAnt4bex8WdE1JoF4Xgov6jF2c1PRLQ27i9Rcwn11O-lmf5z8nUgfCNAk2FYxsd1gY4ve5fuelMrba1pPsIjfS1FiyL-vJiHfCUeeWxPzB7-iZ3A9bYQ6Yz7Zau4yUfeXDkeGNpGlz0IjLsB5C7ITpwNysPRL7xHvafNp2-eTCfpujO8S3w7GfEL3ZaMo0NENJUCCIvwvLd30lYtFAQOjtmvuA7OoN_uZHqsTeN2LX_bDVk-bqeAxzUc', online: false },
        { name: 'TheCardKing', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaLgpLocgiRVVdTH7iMISNfyc2PXjX77HsEiNiJlqT4qUKhvmBMfc-mfFu9QIsIVcJBr--i3ryaeI8PxYSdhKvtAO2H-3Ii41_BFEBA7UWfuTOD-lk3Rh1x34xRA7qpvW7wEx522a55e9ON1bTBrVyB29MRvhS7iGZsRlM8UxCtZjQRq0xDjeV1EeomUtZLHfffraByFnu1in8W8jujwGwWEqLVqhosJEn8dFwV5F9LYwl0lhL0z0xBntWoINkLcBUSYgzAmtFAqu5', online: true },
    ];

    return (
        <section>
            <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">verified</span> Popular Auctioneers
                </h2>
                <a href="#" className="text-sm font-semibold text-primary hover:underline">See All</a>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar no-scrollbar">
                {auctioneers.map((auctioneer, index) => (
                    <div key={index} className="flex flex-col items-center gap-2 min-w-[100px] cursor-pointer group">
                        <div className="relative">
                            <div className={`w-20 h-20 rounded-full p-1 ${auctioneer.online ? 'bg-gradient-to-tr from-primary to-purple-500' : 'bg-gray-600'}`}>
                                <div
                                    className="w-full h-full rounded-full bg-cover bg-center border-2 border-background-dark"
                                    style={{ backgroundImage: `url('${auctioneer.img}')` }}
                                ></div>
                            </div>
                            {auctioneer.online && (
                                <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-background-dark rounded-full"></span>
                            )}
                        </div>
                        <p className="text-xs font-bold text-center group-hover:text-primary transition-colors">{auctioneer.name}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default AuctioneerRail;
