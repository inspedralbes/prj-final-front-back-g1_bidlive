import { useState, useEffect, useCallback } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const usePujas = (filters = {}) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPujas = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (filters.status) params.set('status', filters.status);
            if (filters.q) params.set('q', filters.q);

            const url = `${BASE_URL}/auction/pujas${params.toString() ? `?${params}` : ''}`;
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            setData(Array.isArray(json) ? json : []);
        } catch (err) {
            console.error('[usePujas]', err);
            setError(err.message);
            setData([]);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.status, filters.q]);

    useEffect(() => {
        fetchPujas();
    }, [fetchPujas]);

    return { data, loading, error, refetch: fetchPujas };
};

export const usePujasByUser = (userId) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPujas = useCallback(async () => {
        if (!userId) { setLoading(false); return; }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${BASE_URL}/auction/pujas/user/${userId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            // Normalize snake_case DB fields → camelCase for consistent access in components
            const normalized = (Array.isArray(json) ? json : []).map(p => ({
                ...p,
                currentPrice: p.current_price ?? p.currentPrice ?? p.starting_price ?? p.startingPrice ?? 0,
                startingPrice: p.starting_price ?? p.startingPrice ?? 0,
                img: p.image_url || p.img || null,
                seller: p.seller_username || p.seller || `User ${p.seller_id}`,
                sellerReputation: p.reputation_score ?? p.sellerReputation ?? 0,
                sellerTotalSales: p.total_sales ?? p.sellerTotalSales ?? 0,
            }));
            setData(normalized);
        } catch (err) {
            console.error('[usePujasByUser]', err);
            setError(err.message);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchPujas();
    }, [fetchPujas]);

    return { data, loading, error, refetch: fetchPujas };
};
