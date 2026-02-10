import React from 'react';

const UpcomingAuctions = () => {
    return (
        <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-border-dark overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-border-dark flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Upcoming Scheduled</h3>
                <button className="text-sm font-bold text-primary hover:underline">Calendar</button>
            </div>
            <div className="p-4 space-y-4">
                <div className="flex gap-4 p-4 border border-slate-200 dark:border-border-dark rounded-xl hover:border-primary/50 transition-colors group cursor-pointer">
                    <div className="bg-center bg-cover h-16 w-16 rounded-lg bg-gray-200" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCyOsqB-gYlRKVx_uP2U90ePZzFpQyQzJjXwQZJ_XgVqYxKqZJjXwQZJ_XgVqYxKqZJjXwQZJ_XgVqYxKw')" }}></div> {/* Placeholder or real img */}
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Vintage Comic Book Collection</h4>
                            <span className="bg-slate-100 dark:bg-black/20 text-slate-500 text-xs font-bold px-2 py-1 rounded">Draft</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-[#ba9ca1] mt-1">Starts: Tomorrow, 10:00 AM</p>
                    </div>
                    <button className="self-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">edit</span>
                    </button>
                </div>

                <div className="flex gap-4 p-4 border border-slate-200 dark:border-border-dark rounded-xl hover:border-primary/50 transition-colors group cursor-pointer">
                    <div className="bg-center bg-cover h-16 w-16 rounded-lg bg-gray-200" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDaLgpLocgiRVVdTH7iMISNfyc2PXjX77HsEiNiJlqT4qUKhvmBMfc-mfFu9QIsIVcJBr--i3ryaeI8PxYSdhKvtAO2H-3Ii41_BFEBA7UWfuTOD-lk3Rh1x34xRA7qpvW7wEx522a55e9ON1bTBrVyB29MRvhS7iGZsRlM8UxCtZjQRq0xDjeV1EeomUtZLHfffraByFnu1in8W8jujwGwWEqLVqhosJEn8dFwV5F9LYwl0lhL0z0xBntWoINkLcBUSYgzAmtFAqu5')" }}></div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Rare Pokemon Cards Box Break</h4>
                            <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded">Scheduled</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-[#ba9ca1] mt-1">Starts: Fri, Nov 24, 8:00 PM</p>
                    </div>
                    <button className="self-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">edit</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpcomingAuctions;
