import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export function useSellers(filters = {}) {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSellers = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (filters.q) params.append('q', filters.q);
            if (filters.limit) params.append('limit', filters.limit);
            if (filters.offset) params.append('offset', filters.offset);

            const response = await fetch(`${API_URL}/auth/profile/search?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch sellers');
            }

            const data = await response.json();
            setSellers(data);
        } catch (err) {
            console.error('Error fetching sellers:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSellers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.q, filters.limit, filters.offset]);

    return { sellers, loading, error, refetch: fetchSellers };
}
