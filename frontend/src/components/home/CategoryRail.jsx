import React from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '../../hooks/useCategories';

const CategoryRail = () => {
    const { categories, loading } = useCategories();

    if (loading) {
        return (
            <section className="bg-surface-dark/50 p-8 rounded-2xl border border-border-dark dark:bg-surface-dark/50 bg-white/50 dark:border-border-dark border-gray-200">
                <h2 className="text-xl font-bold mb-8 px-2">Browse by Category</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-3 p-4 rounded-xl">
                            <div className="w-12 h-12 rounded-full skeleton" />
                            <div className="skeleton h-3 w-16 rounded" />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="bg-surface-dark/50 p-8 rounded-2xl border border-border-dark dark:bg-surface-dark/50 bg-white/50 dark:border-border-dark border-gray-200">
            <h2 className="text-xl font-bold mb-8 px-2">Browse by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {categories.map((cat) => (
                    <Link
                        key={cat.id}
                        to={`/explore?categoryId=${cat.id}&categoryName=${encodeURIComponent(cat.name)}`}
                        className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-surface-dark hover:bg-primary transition-all rounded-xl group shadow-sm dark:shadow-none no-underline"
                    >
                        <div className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full group-hover:bg-white/20 transition-colors">
                            <span className="material-symbols-outlined text-gray-600 dark:text-white group-hover:text-white">{cat.icon}</span>
                        </div>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 group-hover:text-white transition-colors text-center">{cat.name}</span>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default CategoryRail;
