import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const RecentSalesTable = () => {
    const { user } = useAuth();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        api.getAuctionsByUser(user.id)
            .then(data => {
                const list = Array.isArray(data) ? data : [];
                // Show ended auctions as "sales"
                setSales(list.filter(p => p.status === 'ended').slice(0, 10));
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [user]);

    return (
        <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-border-dark overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-200 dark:border-border-dark flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Recent Sales</h3>
                <Link to="/profile" className="text-sm font-bold text-primary hover:underline">View All</Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : sales.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                    <span className="material-symbols-outlined text-4xl mb-2">receipt_long</span>
                    <p className="font-medium">No completed sales yet.</p>
                    <Link to="/create-auction" className="mt-3 inline-block text-primary font-bold hover:underline text-sm">
                        Create your first auction →
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-500 dark:text-[#ba9ca1]">
                        <thead className="bg-slate-50 dark:bg-black/20 uppercase font-bold text-xs tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Item</th>
                                <th className="px-6 py-4">Final Price</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-border-dark">
                            {sales.map((sale) => (
                                <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900 dark:text-white">{sale.title}</div>
                                        <div className="text-xs">{sale.description?.slice(0, 40) || '—'}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                        ${sale.current_price || sale.starting_price}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded text-xs font-bold border bg-slate-100 text-slate-600 border-slate-200">
                                            Ended
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            to={`/auction/photo/${sale.id}`}
                                            className="text-slate-400 hover:text-primary transition-colors"
                                        >
                                            <span className="material-symbols-outlined">open_in_new</span>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default RecentSalesTable;
