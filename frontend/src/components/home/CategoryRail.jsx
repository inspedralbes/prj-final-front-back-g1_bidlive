import React from 'react';

const CategoryRail = () => {
    const categories = [
        { name: 'Sneakers', icon: 'style' },
        { name: 'Trading Cards', icon: 'playing_cards' },
        { name: 'Watches', icon: 'watch_off' },
        { name: 'Fine Art', icon: 'palette' },
        { name: 'Jewelry', icon: 'diamond' },
        { name: 'More', icon: 'grid_view' },
    ];

    return (
        <section className="bg-surface-dark/50 p-8 rounded-2xl border border-border-dark dark:bg-surface-dark/50 bg-white/50 dark:border-border-dark border-gray-200">
            <h2 className="text-xl font-bold mb-8 px-2">Browse by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {categories.map((cat, index) => (
                    <div key={index} className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-surface-dark hover:bg-primary transition-all rounded-xl cursor-pointer group shadow-sm dark:shadow-none">
                        <div className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full group-hover:bg-white/20 transition-colors">
                            <span className="material-symbols-outlined text-gray-600 dark:text-white group-hover:text-white">{cat.icon}</span>
                        </div>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 group-hover:text-white transition-colors">{cat.name}</span>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CategoryRail;
