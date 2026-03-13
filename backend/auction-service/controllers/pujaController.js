const Puja = require('../models/Puja');
const db = require('../config/db');

const pujaController = {
    createPuja: async (req, res) => {
        try {
            const { title, description, category, reservePrice, duration, mode, startingPrice, sellerId } = req.body;
            let imageUrl = req.body.imageUrl;

            if (req.file) {
                const protocol = req.protocol;
                const host = req.get('host');
                const servicePrefix = process.env.SERVICE_PREFIX || '';
                imageUrl = `${protocol}://${host}${servicePrefix}/uploads/${req.file.filename}`;
            }

            if (!title || !startingPrice || !sellerId) {
                return res.status(400).json({ message: 'Title, starting price, and seller ID are required' });
            }

            const newPuja = await Puja.create(title, description, category, reservePrice, duration, mode, startingPrice, imageUrl, sellerId, 'upcoming');
            res.status(201).json({ message: 'Puja created successfully', puja: newPuja });
        } catch (error) {
            console.error('Error creating puja:', error);
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    },

    getPujaById: async (req, res) => {
        try {
            const { id } = req.params;
            const puja = await Puja.findById(id);
            if (!puja) return res.status(404).json({ message: 'Puja not found' });
            res.json(puja);
        } catch (error) {
            console.error('Error fetching puja:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    getPujas: async (req, res) => {
        try {
            const { status, q, categoryId } = req.query;
            const pujas = await Puja.findAll(status, q, categoryId ? Number(categoryId) : null);

            const formattedPujas = pujas.map(p => ({
                id: p.id,
                title: p.title,
                description: p.description,
                img: p.image_url || 'https://images.unsplash.com/photo-1550259979-ed79b48d2a30?auto=format&fit=crop&q=80',
                seller: p.seller_username || `User ${p.seller_id}`,
                sellerId: p.seller_id,
                sellerReputation: p.reputation_score || 0,
                sellerTotalSales: p.total_sales || 0,
                sellerImg: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80',
                category: p.category || 'General',
                currentPrice: p.current_price,
                bid: `$${p.current_price}`,
                viewers: Math.floor(Math.random() * 200) + 10,
                status: p.status,
            }));

            res.json(formattedPujas);
        } catch (error) {
            console.error('Error fetching pujas:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    getPujasByUser: async (req, res) => {
        try {
            const { userId } = req.params;
            const pujas = await Puja.findBySellerId(userId);
            res.json(pujas);
        } catch (error) {
            console.error('Error fetching user pujas:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    /**
     * Mark the auction as LIVE.
     * Allows transition from any non-ended state → live (idempotent if already live).
     */
    startPuja: async (req, res) => {
        try {
            const { id } = req.params;
            const puja = await Puja.findById(id);
            if (!puja) {
                return res.status(404).json({ message: 'Puja not found' });
            }

            if (puja.status === 'ended') {
                return res.status(400).json({ message: 'Cannot restart an ended auction' });
            }

            // Update to live regardless of current state (upcoming or already live = idempotent)
            await Puja.updateStatus(id, 'live');
            console.log(`[Auction] Puja ${id} started (status → live)`);

            res.json({ message: 'Puja started', id, status: 'live' });
        } catch (error) {
            console.error('Error starting puja:', error);
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    },

    /**
     * Mark the auction as ENDED and Declare a winner.
     */
    endPuja: async (req, res) => {
        try {
            const { id } = req.params;
            const { winnerId, finalPrice } = req.body;
            
            const puja = await Puja.findById(id);
            if (!puja) {
                return res.status(404).json({ message: 'Puja not found' });
            }

            // Update status, winner and payment status
            await Puja.endWithWinner(id, winnerId || null, finalPrice || puja.current_price);
            console.log(`[Auction] Puja ${id} ended. Winner: ${winnerId}, Price: ${finalPrice}`);

            // Update seller reputation
            try {
                await db.query(
                    'UPDATE users SET reputation_score = reputation_score + 1, total_sales = total_sales + 1 WHERE id = ?',
                    [puja.seller_id]
                );
            } catch (repErr) {
                console.error('[Auction] Reputation update failed:', repErr.message);
            }

            res.json({ message: 'Puja ended', id, status: 'ended', winnerId, finalPrice });
        } catch (error) {
            console.error('Error ending puja:', error);
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    },

    getPayments: async (req, res) => {
        try {
            const { userId } = req.params;
            const payments = await Puja.findPaymentsByWinner(userId);
            res.json(payments);
        } catch (error) {
            console.error('Error fetching payments:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    processPayment: async (req, res) => {
        try {
            const { id } = req.params;
            const { method } = req.body; // 'wallet' or 'stripe'
            const authUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3000';
            const authHeader = req.headers.authorization;

            const auction = await Puja.findById(id);
            if (!auction) return res.status(404).json({ message: 'Subasta no encontrada' });
            
            const price = auction.current_price || auction.starting_price;

            if (method === 'wallet') {
                const response = await fetch(`${authUrl}/wallet/pay`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: authHeader },
                    body: JSON.stringify({ amount: price, auctionId: id })
                });

                const data = await response.json();
                if (response.ok && data.success) {
                    await Puja.updatePaymentStatus(id, 'paid');
                    return res.json({ success: true, message: '¡Pago realizado con tu billetera!' });
                } else {
                    return res.status(400).json({ success: false, message: data.message || 'Error al pagar con billetera' });
                }
            } else if (method === 'stripe') {
                const response = await fetch(`${authUrl}/payment/create-checkout-session`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: authHeader },
                    body: JSON.stringify({ amount: price, auctionId: id })
                });

                const data = await response.json();
                if (response.ok && data.url) {
                    return res.json({ success: true, url: data.url });
                } else {
                    return res.status(500).json({ success: false, message: 'Error al crear sesión de Stripe' });
                }
            } else {
                return res.status(400).json({ message: 'Método de pago no válido' });
            }
        } catch (error) {
            console.error('CRITICAL ERROR processing payment:', {
                message: error.message,
                stack: error.stack,
                auctionId: id
            });
            res.status(500).json({ 
                message: 'Error interno del servidor al procesar el pago', 
                error: error.message,
                details: 'Comprueba la conexión entre servicios y las variables de entorno.'
            });
        }
    },

    toggleFavorite: async (req, res) => {
        try {
            const { userId, pujaId } = req.body;
            if (!userId || !pujaId) return res.status(400).json({ message: 'User ID and Puja ID required' });

            const favorited = await Puja.isFavorite(userId, pujaId);
            if (favorited) {
                await Puja.removeFavorite(userId, pujaId);
                res.json({ favorited: false, message: 'Removed from favorites' });
            } else {
                await Puja.addFavorite(userId, pujaId);
                res.json({ favorited: true, message: 'Added to favorites' });
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    getFavorites: async (req, res) => {
        try {
            const { userId } = req.params;
            const favorites = await Puja.findFavoritesByUser(userId);
            
            const formatted = favorites.map(p => ({
                id: p.id,
                title: p.title,
                description: p.description,
                img: p.image_url || 'https://images.unsplash.com/photo-1550259979-ed79b48d2a30?auto=format&fit=crop&q=80',
                seller: p.seller_username || `User ${p.seller_id}`,
                currentPrice: p.current_price,
                startingPrice: p.starting_price,
                status: p.status
            }));

            res.json(formatted);
        } catch (error) {
            console.error('Error getting favorites:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    checkFavorite: async (req, res) => {
        try {
            const { userId, pujaId } = req.params;
            const favorited = await Puja.isFavorite(userId, pujaId);
            res.json({ favorited });
        } catch (error) {
            console.error('Error checking favorite:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    markPaid: async (req, res) => {
        try {
            const { id } = req.params;
            const { secret } = req.body;
            if (secret !== (process.env.INTERNAL_SECRET || 'bidlive_secret')) {
                return res.status(403).json({ message: 'Forbidden' });
            }
            await Puja.updatePaymentStatus(id, 'paid');
            res.json({ success: true, message: `Auction ${id} marked as paid` });
        } catch (error) {
            console.error('Error marking as paid:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};

module.exports = pujaController;
