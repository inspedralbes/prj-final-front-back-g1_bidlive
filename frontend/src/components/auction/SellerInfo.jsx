import React from 'react';

const SellerInfo = () => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#39282b] pb-6">
            <div className="flex gap-4">
                <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-xl h-16 w-16 shadow-lg border-2 border-primary/20"
                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCJALaLrJCkHLoF8F2FTzpI6ccO-FC3XgUVkX8_YZDs5uBe6TDts7HoD7sgopP6tS1sJ26Ymo7ktLlEG41VJagGSRAdH0TaIPGXfuS10klvmKBJk4RX8n2lsyheafAAMLudErBM7yYABlmzIhkKQFFwXebnHmmbNxQwqVErUPUIg4NPDR5m4c4XaOJPj9gfIPRPLUArfrxgAmNpdBztbfLKSZHtM66MhiFWSW0hm6LFfQEJkR4ENzIskppClLRnI0sJUYvYyur4u6Vc')" }}
                ></div>
                <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                        <p className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">Vintage Vault Auctions</p>
                        <span className="material-symbols-outlined text-blue-400 text-sm">verified</span>
                    </div>
                    <p className="text-[#ba9ca1] text-sm font-normal leading-normal">15.4k Followers • 98% Positive feedback</p>
                </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
                <button className="flex-1 md:flex-none flex min-w-[100px] cursor-pointer items-center justify-center gap-2 rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold transition-all hover:bg-primary/80">
                    <span className="material-symbols-outlined text-lg">person_add</span>
                    Follow
                </button>
                <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-[#39282b] text-white hover:bg-white/10 transition-colors">
                    <span className="material-symbols-outlined">share</span>
                </button>
            </div>
        </div>
    );
};

export default SellerInfo;
