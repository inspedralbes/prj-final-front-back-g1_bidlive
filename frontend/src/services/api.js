const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Error Handler
const handleResponse = async (response) => {
    if (!response.ok) {
        let errorMessage = 'An error occurred';
        try {
            const data = await response.json();
            errorMessage = data.error || data.message || errorMessage;
        } catch (e) {
            errorMessage = response.statusText;
        }
        throw new Error(errorMessage);
    }
    return response.json();
};

export const api = {
    // ---- AUCTIONS ----

    // Get all auctions (optional filtering via query standard)
    getAuctions: async (status = '', search = '') => {
        const url = new URL(`${API_URL}/auction/pujas`);
        if (status) {
            url.searchParams.append('status', status);
        }
        if (search) {
            url.searchParams.append('q', search);
        }
        return fetch(url).then(handleResponse);
    },

    // Get specific auction
    getAuctionById: async (id) => {
        return fetch(`${API_URL}/auction/pujas/${id}`).then(handleResponse);
    },

    // Get auctions by seller
    getAuctionsByUser: async (userId) => {
        return fetch(`${API_URL}/auction/pujas/user/${userId}`).then(handleResponse);
    },

    // Create a new auction
    createAuction: async (formData) => {
        return fetch(`${API_URL}/auction/pujas`, {
            method: 'POST',
            body: formData,
            // don't set Content-Type header when sending FormData
        }).then(handleResponse);
    },

    // ---- AUTHORS / SELLERS ----

    // Derived from active auctions since there is no native endpoint for 'Sellers' yet
    getTopSellers: async () => {
        const data = await api.getAuctions();
        const sellerMap = {};
        (Array.isArray(data) ? data : []).forEach(puja => {
            const key = puja.seller || `User ${puja.seller_id}`;
            if (!sellerMap[key]) {
                sellerMap[key] = { name: key, items: 0, online: puja.status === 'live' };
            }
            sellerMap[key].items++;
            if (puja.status === 'live') {
                sellerMap[key].online = true;
            }
        });
        return Object.values(sellerMap).sort((a, b) => b.items - a.items);
    }
};

export default api;
