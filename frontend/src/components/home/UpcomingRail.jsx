import React from 'react';

const UpcomingRail = () => {
    const drops = [
        {
            title: "The 'Grail' Sneaker Collection Vol. 2",
            desc: "150+ Rare items from the 90s era.",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD-tGT6-QDtGejMpaehKbUHa8PfikFsfvQmyGHi0I0HQ1L_5Qtc7ogOmeTXuGWI0xVVBr_GPZVkm2GqAFgi6lEZLd6gnDyxeWpd2v-ecMY_6uNYWSmQV6rvMMwDxuudyxGu5-LhSGhbAlswhDG7mjOyvTb-0iYoqsyvnbIg6zv39Lmr_I2Qg0iridZB0GHzugOKkDeGcMnzqnZu1VwG7dY8KloEty7lBHYdoWRxrebd6QTD4t2yaYNn0sYwm3f9OQrLxErqPYAz1aDP",
            startsIn: "02d 14h 55m",
            reminders: "2.4k"
        },
        {
            title: "Tech Legends: Sealed Apple Heritage",
            desc: "Exclusive first-gen iPhone & iPods.",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYK5JJt3pdsrlEJ_WjUHZf3SXXwpUbqbZ0c4-XP2Tujy-ZAI3kleHc-FJP0fmVrJKp4qd8jV7HmcpWFlZBIZOZvYcKPhVnBs0kxm3lX2khMKhTD1akLPANFSp0jjv398aZ9Td5d4cL802Yoo0h6yNa7a0Roc3H5CYAsm8hSsKcFumSvwBRdMSHsiybH0S1CYxmQGxfULieQR6fjO4AHFQL94KzC5VNuQ-iwSNB-c3Wgc7HoGJTdBZcPwy0ftVMHEgFJ7fyrhMFGDui",
            startsIn: "05d 06h 12m",
            reminders: "8.1k"
        },
        {
            title: "Modernism: Digital Art & NFTs Drop",
            desc: "Featuring works from top 5 digital artists.",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD9d4T3GsEGwAlematb4O8dWIGzbWltt-x9ZwUljJ4YrKYGzSBMdstU0wYVHSGPH6aWjwJNRu9fBv1Ns35OT-3YpaUS_SJuriibdDNtSAJWIg8YYzGBCHjzyIttuAWYua6qITSy2J-B_VWFS7Z7OQeZqc24mvg1ni-2C5VqJba43v5o-DTqQja8qvWVJt2CTMZuT3ql2tFVX_eIYJun8qUp3SMut43oltAMXynmOhlib1SH8VsYV2Y1goFgCgR5Pp4NuVh9uZxysJp_",
            startsIn: "01d 02h 30m",
            reminders: "1.2k"
        }
    ];

    return (
        <section className="pb-20">
            <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">calendar_month</span> Upcoming Drops
                </h2>
                <div className="flex gap-2">
                    <button className="p-1 border border-gray-200 dark:border-border-dark rounded bg-white dark:bg-surface-dark hover:bg-gray-100 dark:hover:bg-border-dark">
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button className="p-1 border border-gray-200 dark:border-border-dark rounded bg-white dark:bg-surface-dark hover:bg-gray-100 dark:hover:bg-border-dark">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar no-scrollbar">
                {drops.map((item, index) => (
                    <div key={index} className="min-w-[320px] bg-white dark:bg-surface-dark rounded-xl overflow-hidden border border-gray-200 dark:border-border-dark group">
                        <div className="relative h-40">
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ backgroundImage: `url('${item.img}')` }}
                            ></div>
                            <div className="absolute top-2 right-2">
                                <button className="bg-black/60 backdrop-blur-md p-1.5 rounded-full text-white hover:text-primary">
                                    <span className="material-symbols-outlined text-sm">notifications_active</span>
                                </button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                                <p className="text-white text-[10px] font-bold uppercase tracking-widest">Starts in: <span className="text-primary">{item.startsIn}</span></p>
                            </div>
                        </div>
                        <div className="p-4">
                            <h4 className="font-bold mb-1">{item.title}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{item.desc}</p>
                            <div className="flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    <div className="w-6 h-6 rounded-full border border-white dark:border-surface-dark bg-gray-500"></div>
                                    <div className="w-6 h-6 rounded-full border border-white dark:border-surface-dark bg-gray-600"></div>
                                    <div className="w-6 h-6 rounded-full border border-white dark:border-surface-dark bg-gray-700 flex items-center justify-center text-[8px] font-bold text-white">+12</div>
                                </div>
                                <span className="text-[10px] font-bold text-gray-500">{item.reminders} set reminder</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default UpcomingRail;
