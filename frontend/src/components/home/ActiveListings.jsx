import React from 'react';
import { Link } from 'react-router-dom';

const ActiveListings = () => {
    const listings = [
        {
            id: 101,
            name: "Nike Air Max Rare Edition",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAt0mDk70WKknE6Bf5N1_Lvhn02awTKV4OKMPO_SjAKLouI0-ImoqYwHnU7VpnDBu2qPE8ICeindVfgkRFOBg9miRLKFP1YLTECETw3NkuJ96SnBp-s_7QJo0FdLjURtH3ETfRT3SifQBE2W2A1gTpCc53wXqOxit3j6x5BOwp1qdGuEBPPVd6TRBh3bjI0wj6DNDJJJ_tmFkSo2Cbbb5DpZ35wFderLDRr853Rm5fVZPlJ_CHn3-E6RT_E20g1YNE1ShKNgXoMJ2nw",
            bid: "$145.00",
            bids: 12,
            timeLeft: "04:21"
        },
        {
            id: 102,
            name: "Designer Tee Pack (3)",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxFGjvn9SOUQjATXH-U_P4v7PQee5ugix73yfl0ifWPDUyZALiCoNqkOhDzyNNHo8B3rQ2ZvuIFM-uw54Zqfft9Gbma36qNhOOsNBE4tTo6qKoh47ZCV1MY_zVGgSshbBpQM4Iq-_OgdkxiBr0GzGp-jAFj3Dm1DvrO0PSLNZRLNx2imZDBP9W060eNFeJb-e3rev7jJMwmswd5x2K6m_1WvlIIoL7CeCovROGztffa6P8Hvyprc_LKA8UJHAYaP_Gl3sfWqyUvETy",
            bid: "$65.00",
            bids: 4,
            timeLeft: "12:45"
        },
        {
            id: 103,
            name: "Vintage Parker Fountain Pen",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4FwVkf5qgzoDV_uaqXax_G5YE66tK8suRkWlRS_pBi4Lp0coYDaSD008IS9ArR_0Ua6Qjrpp1PFkcpfsLd7duxOyfQGUBY8LYOctyBE7jOTOtqhITfibzh49frcCT3iIBQiVSr-D2geIwF3-Q_AEYXf-dm-2YGDrgKmNd3SsP_LStlk4sUDDKmsF57Byd_Wg_E6R2tGWfw42WtjUYiAdSKSgHI28xo5m2F9s5McScpR14mGmL9grj6IsngSXqtuk3HZzmUu1Plisz",
            bid: "$210.00",
            bids: 22,
            timeLeft: "02:10"
        },
        {
            id: 104,
            name: "Leica 35mm f/1.4 Lens",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2KsuHJYeRbSxXlll1bTDphqVhfjZ2UU3lMNxZlxECYyHb4mf9I4zgHsKoZi-XCaBDblkAGQ1SLdbJrg5D-HkwcLIQIOQwdwBds7iwpIA6Zmfv0gEitbFQ9eEDQ7I0d-I4PtfAz__qU-p219SIuY2_USzh3LrR4TrHcr_PBSUGPw3sxRaqMcAf0KxT2m8sMcGUXCP8HLUKTLYU9HSR69EHXQbCA8cOn1cNxBAXvMOxFaPKlDzq3qW_LZqpFjQZw-DHYgi2W5szf40K",
            bid: "$1,850.00",
            bids: 15,
            timeLeft: "08:33"
        },
        {
            id: 105,
            name: "2023 Creator Laptop Pro",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDqX77QOAw5hxLowU_9vfI3ytPQC_NpjpYcPMT7mzxz868bXBxSHozCSd0VrmSKSmlcHv7GZoyQo30YCn1nCMknC5O2YTkUR5XOL7ZAFRGL9wUIgsxL2waFz_ugWmvvZHp2Q6LkC9ODWChnJh--1_ukOVU3GfS8Bo_BzpKv_aRvP0i3956IUt0pluQKQfF_LAqx4bpckiOUKtuLbunv9DoUgsjegJ7vHBNkd5ZalgR6LCA6_SlE_1jBxA0xu4Uv7qKj3kLzVpOq16Uu",
            bid: "$920.00",
            bids: 31,
            timeLeft: "01:45"
        }
    ];

    return (
        <section>
            <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">shopping_bag</span> Active Listings
                </h2>
                <Link to="/explore" className="text-sm font-semibold text-primary hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {listings.map(item => (
                    <Link to={`/auction/photo/${item.id}`} key={item.id} className="bg-white dark:bg-surface-dark rounded-xl overflow-hidden border border-gray-200 dark:border-border-dark flex flex-col group cursor-pointer shadow-lg hover:shadow-primary/10 transition-shadow">
                        <div className="relative aspect-square">
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ backgroundImage: `url('${item.img}')` }}
                            ></div>
                            <div className="absolute top-2 left-2">
                                <span className="bg-primary text-[8px] font-black px-1.5 py-0.5 rounded text-white tracking-tighter">BIDDING</span>
                            </div>
                            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-white flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px] text-primary">timer</span> {item.timeLeft}
                            </div>
                        </div>
                        <div className="p-3">
                            <h4 className="text-xs font-bold line-clamp-1 mb-1">{item.name}</h4>
                            <div className="flex items-end justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-500 font-bold uppercase">Current Bid</span>
                                    <span className="text-sm font-black text-slate-900 dark:text-white">{item.bid}</span>
                                </div>
                                <span className="text-[10px] text-gray-400">{item.bids} bids</span>
                            </div>
                        </div>
                        <button className="w-full bg-primary/10 group-hover:bg-primary py-2 text-[10px] font-black tracking-widest text-primary group-hover:text-white uppercase transition-colors">
                            Quick Bid
                        </button>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default ActiveListings;
