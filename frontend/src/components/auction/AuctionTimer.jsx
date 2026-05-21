import React, { useState, useEffect, useRef } from 'react';

/**
 * AuctionTimer — displays the countdown to end_time.
 *
 * Uses serverSecondsLeft (authoritative integer from the server) as the
 * starting point and counts down locally using setInterval.
 * This guarantees ALL clients show the same value regardless of their
 * local clock, timezone or network latency.
 *
 * Falls back to endTime + serverTimeOffset calculation if serverSecondsLeft
 * is not available (e.g. auction started before this change).
 */
export default function AuctionTimer({ endTime, serverTimeOffset = 0, serverSecondsLeft = null }) {
    const [timeLeft, setTimeLeft] = useState(null);
    const [isLow, setIsLow] = useState(false);

    // Track the base provided by the server so we can restart the local
    // countdown whenever a new authoritative value arrives.
    const baseRef = useRef({ seconds: null, timestamp: null });

    // When serverSecondsLeft changes (new NEW_END_TIME from server), reset base
    useEffect(() => {
        if (serverSecondsLeft === null || serverSecondsLeft === undefined) return;
        baseRef.current = { seconds: serverSecondsLeft, timestamp: Date.now() };
        // Immediately update display
        setTimeLeft(serverSecondsLeft);
        setIsLow(serverSecondsLeft < 60);
    }, [serverSecondsLeft]);

    // Local tick — counts down from the server-provided base using local elapsed time
    useEffect(() => {
        const tick = () => {
            let remaining;

            if (baseRef.current.seconds !== null) {
                // Preferred path: count down from server-authoritative base
                const elapsed = Math.floor((Date.now() - baseRef.current.timestamp) / 1000);
                remaining = Math.max(0, baseRef.current.seconds - elapsed);
            } else if (endTime) {
                // Fallback: compute from endTime and serverTimeOffset
                const serverNow = Date.now() - serverTimeOffset;
                remaining = Math.max(0, Math.floor((new Date(endTime).getTime() - serverNow) / 1000));
            } else {
                return;
            }

            setTimeLeft(remaining);
            setIsLow(remaining < 60);
        };

        tick();
        const iv = setInterval(tick, 1000);
        return () => clearInterval(iv);
    }, [endTime, serverTimeOffset]);

    const format = (secs) => {
        if (secs === null || secs === undefined) return '--:--';
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        const parts = [];
        if (h > 0) parts.push(`${h}h`);
        if (m > 0 || h > 0) parts.push(`${m}m`);
        parts.push(`${s}s`);
        return parts.join(' ');
    };

    return (
        <div className="flex flex-col">
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Tiempo restante</p>
            <div className={`flex items-center gap-2 ${isLow ? 'animate-pulse' : ''}`}>
                <span className={`material-symbols-outlined text-sm ${isLow ? 'text-red-500' : 'text-amber-400'}`}>
                    schedule
                </span>
                <span className={`text-xl font-black tabular-nums ${isLow ? 'text-red-500' : 'text-white'}`}>
                    {format(timeLeft)}
                </span>
            </div>
        </div>
    );
}
