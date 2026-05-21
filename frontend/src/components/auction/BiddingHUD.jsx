import React, { useState } from 'react';
import AuctionTimer from './AuctionTimer';

/**
 * BiddingHUD — viewer-facing bid panel.
 * Props:
 *   currentBid   number | string   – current highest bid
 *   placeBid     function(amount)  – from useWebSocket
 *   disabled     bool              – when not connected
 */
export default function BiddingHUD({ currentBid = 0, hasBids = false, placeBid, disabled = false, status = 'none', balance = 0, endTime = null, serverTimeOffset = 0, serverSecondsLeft = null }) {
    const current = typeof currentBid === 'string'
        ? parseFloat(currentBid.replace(/[^0-9.]/g, '')) || 0
        : Number(currentBid) || 0;

    const getMinIncrement = (price) => {
        if (price >= 500) return 10;
        if (price >= 100) return 5;
        return 1;
    };

    const minIncrement = getMinIncrement(current);
    const minRequired = hasBids ? (current + minIncrement) : current;

    const suggestedBids = [
        minRequired,
        minRequired + minIncrement,
        minRequired + (minIncrement * 5),
        minRequired + (minIncrement * 10),
    ];

    const [customAmount, setCustomAmount] = useState('');
    const [lastBid, setLastBid] = useState(null);
    const [error, setError] = useState('');

    const handleBid = (amount) => {
        const num = Number(amount);
        if (!num || num < minRequired) {
            setError(`La puja mínima es de ${Math.ceil(minRequired)}€.`);
            return;
        }
        if (num > balance) {
            setError('Saldo insuficiente en tu billetera.');
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
            {/* Timer & Balance */}
            <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <AuctionTimer endTime={endTime} serverTimeOffset={serverTimeOffset} serverSecondsLeft={serverSecondsLeft} />
                <div className="text-right">
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Tu Saldo</p>
                    <p className="text-white font-black text-lg">{balance.toLocaleString()}€</p>
                </div>
            </div>

            {/* Current bid */}
            <div className="flex items-center justify-between mb-5">
                <div key={current} className="animate-bid-flash rounded-lg p-1 -m-1 transition-colors">
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
                        {hasBids ? 'Current bid' : 'Starting Price'}
                    </p>
                    <p className="text-white font-black text-4xl">{current.toLocaleString()}€</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    {status === 'winning' && (
                        <div className="badge-live" style={{ background: 'rgba(34, 197, 94, 0.15)', borderColor: 'rgba(34, 197, 94, 0.3)', color: '#22c55e' }}>
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            GANANDO
                        </div>
                    )}
                    {status === 'outbid' && hasBids && (
                        <div className="badge-live" style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.3)', color: '#f59e0b' }}>
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            SUPERADO
                        </div>
                    )}
                    {lastBid && (
                        <div className="text-right">
                            <p className="text-gray-600 text-xs mb-1">Your last bid</p>
                            <p className="text-amber-400 font-bold text-lg">{lastBid.toLocaleString()}€</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick bid buttons */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                {suggestedBids.map((amt) => (
                    <button
                        key={amt}
                        onClick={() => handleBid(amt)}
                        disabled={disabled}
                        className="min-h-[44px] py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{
                            background: 'rgba(245,158,11,0.08)',
                            border: '1px solid rgba(245,158,11,0.2)',
                            color: '#f59e0b',
                        }}
                        onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = 'rgba(245,158,11,0.18)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'; } }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.08)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.2)'; }}
                    >
                        {amt === current ? (
                            `Puja Inicial (${amt.toLocaleString()}€)`
                        ) : (
                            <><span className="font-black">+{amt - current}€</span> <span className="font-normal opacity-60">({amt.toLocaleString()}€)</span></>
                        )}
                    </button>
                ))}
            </div>

            {/* Custom bid */}
            <form onSubmit={handleCustomSubmit} className="flex gap-2">
                <div className="relative flex-1">
                    <input
                        className="input-field text-sm py-2.5"
                        type="number"
                        min={minRequired}
                        step="1"
                        placeholder={`Mín. ${Math.ceil(minRequired)}€`}
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
                    Pujar
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
