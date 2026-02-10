import React from 'react';

const RecentSalesTable = () => {
    const sales = [
        { item: 'Rolex Submariner 5513', date: '2 hours ago', price: '$14,500', buyer: 'WatchKing99', status: 'Processing' },
        { item: 'PSA 10 Charizard', date: '5 hours ago', price: '$4,200', buyer: 'PokeMaster', status: 'Shipped' },
        { item: 'Gibson Les Paul 1959', date: '1 day ago', price: '$285,000', buyer: 'GuitarHero', status: 'Completed' },
        { item: 'Banksy Print (Signed)', date: '2 days ago', price: '$22,000', buyer: 'ArtCollector', status: 'Completed' },
    ];

    return (
        <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-border-dark overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-200 dark:border-border-dark flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Recent Sales</h3>
                <button className="text-sm font-bold text-primary hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-500 dark:text-[#ba9ca1]">
                    <thead className="bg-slate-50 dark:bg-black/20 uppercase font-bold text-xs tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Item</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4">Buyer</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-border-dark">
                        {sales.map((sale, index) => (
                            <tr key={index} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-900 dark:text-white">{sale.item}</div>
                                    <div className="text-xs">{sale.date}</div>
                                </td>
                                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{sale.price}</td>
                                <td className="px-6 py-4 flex items-center gap-2">
                                    <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">{sale.buyer[0]}</div>
                                    {sale.buyer}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold border ${sale.status === 'Completed' ? 'bg-green-100 text-green-600 border-green-200' :
                                            sale.status === 'Processing' ? 'bg-amber-100 text-amber-600 border-amber-200' :
                                                'bg-blue-100 text-blue-600 border-blue-200'
                                        }`}>
                                        {sale.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                                        <span className="material-symbols-outlined">more_vert</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentSalesTable;
