import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * FavoriteButton — Toggles a puja as favorite.
 * Props:
 *   pujaId    number | string – The auction ID
 *   className string          – Optional extra classes
 */
export default function FavoriteButton({ pujaId, className = "" }) {
    const { user } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);

    const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    useEffect(() => {
        if (!user || !pujaId) return;

        const checkStatus = async () => {
            try {
                const res = await fetch(`${API}/auction/favorites/${user.id}/${pujaId}/check`);
                if (res.ok) {
                    const data = await res.json();
                    setIsFavorite(data.favorited);
                }
            } catch (err) {
                console.error("Check favorite error:", err);
            }
        };
        checkStatus();
    }, [user, pujaId, API]);

    const handleToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            alert("Por favor, inicia sesión para guardar favoritos.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API}/auction/favorites`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, pujaId })
            });

            if (res.ok) {
                const data = await res.json();
                setIsFavorite(data.favorited);
            }
        } catch (err) {
            console.error("Toggle favorite error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 ${className}`}
            title={isFavorite ? "Eliminar de favoritos" : "Añadir a favoritos"}
        >
            <span 
                className="material-symbols-outlined" 
                style={{ 
                    fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0",
                    color: isFavorite ? '#ef4444' : 'inherit'
                }}
            >
                favorite
            </span>
        </button>
    );
}
