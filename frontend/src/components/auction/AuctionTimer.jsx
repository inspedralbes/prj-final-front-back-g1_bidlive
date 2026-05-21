import React, { useState, useEffect } from 'react';

export default function AuctionTimer({ endTime, serverTimeOffset = 0 }) {
    const [timeLeft, setTimeLeft] = useState('');
    const [isLow, setIsLow] = useState(false);

    useEffect(() => {
        if (!endTime) return;

        const timer = setInterval(() => {
            const localNow = new Date().getTime();
            const now = localNow - serverTimeOffset;
            const end = new Date(endTime).getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft('¡FINALIZADO!');
                setIsLow(false);
                clearInterval(timer);
                return;
            }

            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            setIsLow(diff < 60000); // Low time if < 1 minute

            const parts = [];
            if (h > 0) parts.push(`${h}h`);
            if (m > 0 || h > 0) parts.push(`${m}m`);
            parts.push(`${s}s`);

            setTimeLeft(parts.join(' '));
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime, serverTimeOffset]);

    return (
        <div className="flex flex-col">
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Tiempo restante</p>
            <div className={`flex items-center gap-2 ${isLow ? 'animate-pulse' : ''}`}>
                <span className={`material-symbols-outlined text-sm ${isLow ? 'text-red-500' : 'text-amber-400'}`}>
                    schedule
                </span>
                <span className={`text-xl font-black tabular-nums ${isLow ? 'text-red-500' : 'text-white'}`}>
                    {timeLeft || '--:--'}
                </span>
            </div>
        </div>
    );
}
