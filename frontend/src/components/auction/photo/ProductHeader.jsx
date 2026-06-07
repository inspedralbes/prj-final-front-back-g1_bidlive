import React from 'react';

const ProductHeader = () => {
    return (
        <div className="flex justify-between items-start pb-6 px-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">Rare Rolex Cosmograph Daytona "Paul Newman"</h1>
                <p className="text-slate-500 dark:text-[#ba9ca1] mt-1">Ref. 6239 · Circa 1968 · 37mm · Exceptional Condition</p>
                <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-[#ba9ca1]">
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        1,248 watching
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-[#ba9ca1]">
                        <span className="material-symbols-outlined text-sm">person</span>
                        42 active bidders
                    </div>
                </div>
            </div>
            <button className="p-3 rounded-full bg-slate-200 dark:bg-[#39282b] text-slate-900 dark:text-white hover:text-primary transition-colors">
                <span className="material-symbols-outlined">share</span>
            </button>
        </div>
    );
};

export default ProductHeader;
