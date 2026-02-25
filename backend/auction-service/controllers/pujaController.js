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
     * Mark the auction as ENDED.
     * The reputation update is non-blocking — even if it fails, the status WILL be set to 'ended'.
     */
    endPuja: async (req, res) => {
        try {
            const { id } = req.params;
            const puja = await Puja.findById(id);
            if (!puja) {
                return res.status(404).json({ message: 'Puja not found' });
            }

            // Idempotent — already ended is fine
            if (puja.status !== 'ended') {
                // 1. Update status first — this MUST succeed
                await Puja.updateStatus(id, 'ended');
                console.log(`[Auction] Puja ${id} ended (status → ended)`);

                // 2. Update seller reputation — non-blocking, failure won't affect response
                try {
                    await db.query(
                        'UPDATE users SET reputation_score = reputation_score + 1, total_sales = total_sales + 1 WHERE id = ?',
                        [puja.seller_id]
                    );
                    console.log(`[Auction] Reputation updated for seller ${puja.seller_id}`);
                } catch (repErr) {
                    // Log but don't fail — the auction IS ended even if reputation update fails
                    console.error('[Auction] Reputation update failed (non-critical):', repErr.message);
                }
            } else {
                console.log(`[Auction] Puja ${id} was already ended — idempotent`);
            }

            res.json({ message: 'Puja ended', id, status: 'ended' });
        } catch (error) {
            console.error('Error ending puja:', error);
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    },
};

module.exports = pujaController;
