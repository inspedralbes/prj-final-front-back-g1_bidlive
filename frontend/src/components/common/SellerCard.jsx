import React from 'react';
import { Link } from 'react-router-dom';
import FollowButton from './FollowButton';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const SellerCard = ({ seller }) => {
    const { user: currentUser } = useAuth();
    const isOwnProfile = currentUser && currentUser.userId === seller.id;

    // Helper to render stars
    const renderStars = (reputation) => {
        const stars = Math.round(reputation || 0);
        return (
            <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <span 
                        key={i} 
                        className={`material-symbols-outlined text-xs ${i < stars ? 'text-amber-400' : 'text-slate-600'}`}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                        star
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="group rounded-2xl p-5 transition-all hover:-translate-y-1 hover:shadow-2xl flex flex-col h-full"
             style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', minWidth: 0 }}>
            <div className="flex items-start justify-between mb-4 gap-3 min-w-0">
                <Link to={`/profile/${seller.id}`} className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-14 h-14 shrink-0 rounded-2xl overflow-hidden bg-amber-500/10 border border-white/10 relative">
                        {seller.avatar_url ? (
                            <img 
                                src={seller.avatar_url.startsWith('http') ? seller.avatar_url : `${API_URL}${seller.avatar_url}`} 
                                alt={seller.username} 
                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div className="w-full h-full flex items-center justify-center text-amber-500"
                             style={{ display: seller.avatar_url ? 'none' : 'flex' }}>
                            <span className="material-symbols-outlined text-2xl">person</span>
                        </div>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                        <h3 className="text-white font-black text-base leading-tight group-hover:text-amber-400 transition-colors truncate w-full">
                            {seller.username}
                        </h3>
                        <div className="mt-1">
                            {renderStars(seller.reputation)}
                        </div>
                    </div>
                </Link>
                <div className="shrink-0 scale-90 origin-right">
                    <FollowButton sellerId={seller.id} />
                </div>
            </div>

            <div className="flex-1 min-w-0">
                {seller.bio ? (
                    <p className="text-gray-400 text-xs mb-5 leading-relaxed italic break-words line-clamp-2 overflow-hidden"
                       style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        "{seller.bio}"
                    </p>
                ) : (
                    <div className="mb-5" />
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Sales</p>
                    <p className="text-white font-black text-sm">{seller.total_sales || 0}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Followers</p>
                    <p className="text-amber-400 font-black text-sm">{seller.followers_count || 0}</p>
                </div>
            </div>
            
            <div className="mt-4 flex gap-2">
                <Link 
                    to={`/profile/${seller.id}`}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all text-center"
                >
                    Profile
                </Link>
                {!isOwnProfile && (
                    <button 
                        onClick={async () => {
                            const { useChat } = await import('../../hooks/useChat');
                            // Note: This is a hacky way since SellerCard isn't always in a chat context,
                            // but for a quick implementation we can start the conversation and navigate.
                            const token = localStorage.getItem('token');
                            const res = await fetch(`${API_URL}/chat/conversations`, {
                                method: 'POST',
                                headers: { 
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}` 
                                },
                                body: JSON.stringify({ participantId: seller.id })
                            });
                            if (res.ok) {
                                const data = await res.json();
                                window.location.href = `/messages/${data.id}`;
                            }
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black text-[10px] font-bold uppercase tracking-widest hover:bg-amber-400 transition-all text-center flex items-center justify-center gap-1"
                    >
                        <span className="material-symbols-outlined text-sm">mail</span>
                        Message
                    </button>
                )}
            </div>
        </div>
    );
};

export default SellerCard;
