import React, { useState } from 'react';

/**
 * BiddingHUD — viewer-facing bid panel.
 * Props:
 *   currentBid   number | string   – current highest bid
 *   placeBid     function(amount)  – from useWebSocket
 *   disabled     bool              – when not connected
 */
export default function BiddingHUD({ currentBid = 0, placeBid, disabled = false }) {
    const current = typeof currentBid === 'string'
        ? parseFloat(currentBid.replace(/[^0-9.]/g, '')) || 0
        : Number(currentBid) || 0;

    const suggestedBids = [
        current + 10,
        current + 25,
        current + 50,
        current + 100,
    ];

    const [customAmount, setCustomAmount] = useState('');
    const [lastBid, setLastBid] = useState(null);
    const [error, setError] = useState('');

    const handleBid = (amount) => {
        const num = Number(amount);
        if (!num || num <= current) {
            setError(`Bid must be higher than $${current}`);
            return;
        }
        setError('');
        placeBid?.(num);
        setLastBid(num);
        setCustomAmount('');
    };

    const handleCustomSubmit = (e) => {
        e.preventDefault();
        handleBid(parseFloat(customAmount));
    };

    return (
        <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            {/* Current bid */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Current bid</p>
                    <p className="text-white font-black text-4xl">${current.toLocaleString()}</p>
                </div>
                {lastBid && (
                    <div className="text-right">
                        <p className="text-gray-600 text-xs mb-1">Your last bid</p>
                        <p className="text-amber-400 font-bold text-lg">${lastBid.toLocaleString()}</p>
                    </div>
                )}
            </div>

            {/* Quick bid buttons */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                {suggestedBids.map((amt) => (
                    <button
                        key={amt}
                        onClick={() => handleBid(amt)}
                        disabled={disabled}
                        className="py-2.5 px-4 rounded-xl text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{
                            background: 'rgba(245,158,11,0.08)',
                            border: '1px solid rgba(245,158,11,0.2)',
                            color: '#f59e0b',
                        }}
                        onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = 'rgba(245,158,11,0.18)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'; } }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.08)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.2)'; }}
                    >
                        +${amt - current} <span className="font-normal opacity-60">(${amt.toLocaleString()})</span>
                    </button>
                ))}
            </div>

            {/* Custom bid */}
            <form onSubmit={handleCustomSubmit} className="flex gap-2">
                <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                    <input
                        className="input-field pl-7 text-sm py-2.5"
                        type="number"
                        min={current + 1}
                        step="1"
                        placeholder={`Min. $${current + 1}`}
                        value={customAmount}
                        onChange={e => setCustomAmount(e.target.value)}
                        disabled={disabled}
                    />
                </div>
                <button
                    type="submit"
                    disabled={disabled || !customAmount}
                    className="btn-primary py-2.5 px-5 text-sm shrink-0"
                >
                    Place bid
                </button>
            </form>

            {error && (
                <p className="text-red-400 text-xs mt-2.5">{error}</p>
            )}

            {disabled && (
                <p className="text-center text-gray-600 text-xs mt-3">Connect to place a bid</p>
            )}
        </div>
    );
}
