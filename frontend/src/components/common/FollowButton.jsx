import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const FollowButton = ({ sellerId, onToggle }) => {
    const { user } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            if (!user || !sellerId || user.id === parseInt(sellerId)) {
                setLoading(false);
                return;
            }
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API}/auth/follow/check/${sellerId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setIsFollowing(data.following);
                }
            } catch (err) {
                console.error('Error checking follow status:', err);
            } finally {
                setLoading(false);
            }
        };
        checkStatus();
    }, [user, sellerId]);

    const handleToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) return;
        
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API}/auth/follow/toggle`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ sellerId })
            });
            if (res.ok) {
                const data = await res.json();
                setIsFollowing(data.following);
                if (onToggle) onToggle(data.following);
            }
        } catch (err) {
            console.error('Error toggling follow:', err);
        } finally {
            setActionLoading(false);
        }
    };

    if (!user || user.id === parseInt(sellerId)) return null;
    if (loading) return <div className="w-24 h-9 bg-white/5 animate-pulse rounded-xl" />;

    return (
        <button
            onClick={handleToggle}
            disabled={actionLoading}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                isFollowing 
                ? 'bg-white/10 text-white border border-white/20 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/50' 
                : 'bg-amber-500 text-black hover:bg-amber-400'
            }`}
        >
            {actionLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
        </button>
    );
};

export default FollowButton;
