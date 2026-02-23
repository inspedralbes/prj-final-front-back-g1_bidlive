import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const StatsGrid = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ total: 0, live: 0, ended: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        api.getAuctionsByUser(user.id)
            .then(data => {
                const list = Array.isArray(data) ? data : [];
                const live = list.filter(p => p.status === 'live').length;
                const ended = list.filter(p => p.status === 'ended').length;
                setStats({ total: list.length, live, ended });
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [user]);

    const cards = [
        {
            label: 'Total Auctions',
            value: loading ? '—' : stats.total,
            icon: 'gavel',
            color: 'text-primary',
            bg: 'bg-primary/10',
        },
        {
            label: 'Live Now',
            value: loading ? '—' : stats.live,
            icon: 'sensors',
            color: 'text-red-500',
            bg: 'bg-red-500/10',
            badge: stats.live > 0 ? `${stats.live} Live` : null,
            badgeColor: 'text-primary bg-primary/10',
        },
        {
            label: 'Ended',
            value: loading ? '—' : stats.ended,
            icon: 'inventory_2',
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
        },
        {
            label: 'Upcoming',
            value: loading ? '—' : stats.total - stats.live - stats.ended,
            icon: 'schedule',
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {cards.map((card, i) => (
                <div key={i} className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-border-dark shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 ${card.bg} rounded-xl`}>
                            <span className={`material-symbols-outlined ${card.color}`}>{card.icon}</span>
                        </div>
                        {card.badge && (
                            <span className={`text-xs font-bold px-2 py-1 rounded ${card.badgeColor}`}>{card.badge}</span>
                        )}
                    </div>
                    <h3 className="text-slate-500 dark:text-[#ba9ca1] text-sm font-bold uppercase tracking-wider">{card.label}</h3>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{card.value}</p>
                </div>
            ))}
        </div>
    );
};

export default StatsGrid;
