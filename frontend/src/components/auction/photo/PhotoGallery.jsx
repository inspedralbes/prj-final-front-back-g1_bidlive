import React from 'react';

const PhotoGallery = () => {
    const images = [
        { title: 'Front View', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYS2VTYZfTHGwM1YSizHKy-p_U4g85A3oMTkNKuslMLDFPHJwfQXzvbFnSqoc6IibTT1RpBA-Wf9Ot2uo93h3ON5OnDJgqA3noj1L_mYz33k6Pjh0wBXI7bIkpkkmVJ-416ohyXQaUlmebHlkDxxxC_1_3ID-SqVkHbfn7l0OKW_Dzdoz4T7asNWWLkMc3rH8E9idjyyND4wF5DDVKEx0V0xNFZS6GIqeRsLl3UqQ4cuKiTH7MJg2MzAI4nFRmjY41ODrXnq2NuqHN' },
        { title: 'Side Profile', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYXeRd38lshhfFU1skRA9JAgBLCcQzEBQ9jCKBvniONqICDIcFgUg2dBvfTwmDYqGVaCk2Xq3_wN23lvQ_ubN4GRZ_wUMpWxuo2Bf6vUtk6-IimI0SIrue8dXNutgbOt4a-FvXKnJRayvJlDQ1-UU_5Gp2Bgiy1XCkjV4zZ0Tm0NT970ceYMPVhM0zHU-BtwjZG6Ujo4ydTcyHkj9eKciTYavZkzZiVMwXg4ensu3zoNa0NDZduPh9tEPddydQPzK10ZlM5FxzYndg' },
        { title: 'Macro Details', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiF5ol6MU9izvGK6ZDhBBNZYq0OMDmrjL8vW1thN4QsLpxcDHpXe7lHPY8E08IP18w7d5K1AyUOoPPaoV31naUqhScgtydhQuzRSCC_QYIElDmt9f5ed8wsfxYEkgNAjZP6sv7tthr5LFXE1Wjk0qyTiqW9nBBLL0kKZHnDPVyMKmTJ_Ypr8tcY6xCJ2mui63MRRAXWciwlCWOu1tMlM9JFI12xu8REbQGiM3raaydAvwvngujZeLqVeuxm-0ssvw-W1V-uU0-r5vd' },
        { title: 'Authentication', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCyzunzjibOMGN13WE1IUOn7KE6IwFKMsOSmQR9LoBVo7xwKom4Eui68-FVVP4RwkD_UAmC_rJud71YI-w5dgM088rTJ1unAIWmy_6CX0bdNXu5qlEtx0vWh72Rm6hRNJw3tWoglDOceyP9poDyRsrm6mLVFHfZpLvnuWmRe85pu2xISvtp-LWejvMdSPMPcnkiflfHPkmuuL3hUtQUl3jN4zNzSgIPgsjePfUcefKA3LfK7bz1XTYln3c5EywGTdBjeT8EScmjsBv' }
    ];

    return (
        <div className="px-6 flex flex-col gap-4">
            {/* Main View */}
            <div className="relative group">
                <div
                    className="bg-cover bg-center flex flex-col justify-end overflow-hidden rounded-xl min-h-[500px] shadow-2xl relative transition-all"
                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA-OFU60saXq8NMuNqq2f9G-ZrOlryV4E1uzZkngNJdbruNqzjB91Jxxy926Kps0MEc5XkoVJebsdSqvk8gD1-Bwlurv60gz8K3_RPwVvYC_VfKRfbTjEZNdJNsZ3BjCFnETFuEB3E2xymFEH_AR4XgQXTn5kV78aftAkIrYFqlOOrCnQVxO-FgV9EX15yj9l-84eAXbTzuHzVE0ioPPSaKTcFPxl-lm8x-AdINJ_VbEkVztPoIKH_c60-qYKvZHovLR7MjLEeLO0_J')" }}
                >
                    {/* Live Badge */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-white text-xs font-bold uppercase tracking-widest">Live Auction</span>
                    </div>
                    {/* Fullscreen Toggle */}
                    <button className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-lg text-white transition-colors">
                        <span className="material-symbols-outlined">fullscreen</span>
                    </button>

                    <div className="flex justify-center gap-2 p-5 bg-gradient-to-t from-black/60 to-transparent">
                        <div className="size-2 rounded-full bg-white"></div>
                        <div className="size-2 rounded-full bg-white opacity-40"></div>
                        <div className="size-2 rounded-full bg-white opacity-40"></div>
                        <div className="size-2 rounded-full bg-white opacity-40"></div>
                    </div>
                </div>
            </div>

            {/* Gallery Carousel */}
            <div className="flex overflow-x-auto hide-scrollbar pb-4">
                <div className="flex items-stretch gap-4">
                    {images.map((img, index) => (
                        <div key={index} className="flex h-full flex-col gap-2 min-w-40 cursor-pointer group">
                            <div
                                className={`w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg transition-opacity ${index === 0 ? 'ring-2 ring-primary' : 'group-hover:opacity-80'}`}
                                style={{ backgroundImage: `url('${img.url}')` }}
                            ></div>
                            <p className={`text-xs font-medium px-1 ${index === 0 ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-[#ba9ca1]'}`}>
                                {img.title}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PhotoGallery;
