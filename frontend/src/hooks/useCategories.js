import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Fetches the list of categories from the DB via the auction-service.
 * Returns { categories, loading, error }
 * categories: [{ id, name, icon }]
 */
export const useCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${BASE_URL}/auction/categories`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                setCategories(Array.isArray(json) ? json : []);
            } catch (err) {
                console.error('[useCategories]', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    return { categories, loading, error };
};
