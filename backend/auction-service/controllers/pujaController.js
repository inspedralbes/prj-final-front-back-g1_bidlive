const Puja = require('../models/Puja');
const db = require('../config/db');
const { sendNotification, sendMassNotification } = require('../utils/notifications');
const { sendAuctionWinEmail } = require('../services/emailService');

const pujaController = {
    createPuja: async (req, res) => {
        try {
            const { title, description, category, reservePrice, duration, mode, startingPrice, sellerId } = req.body;
            let imageUrl = req.body.imageUrl;
            let streamImageUrl = null;

            if (req.files) {
                const protocol = req.protocol;
                const host = req.get('host');
                const servicePrefix = process.env.SERVICE_PREFIX || '';
                
                if (req.files['image'] && req.files['image'][0]) {
                    imageUrl = `${protocol}://${host}${servicePrefix}/uploads/${req.files['image'][0].filename}`;
                }
                
                if (req.files['streamImage'] && req.files['streamImage'][0]) {
                    streamImageUrl = `${protocol}://${host}${servicePrefix}/uploads/${req.files['streamImage'][0].filename}`;
                }
            } else if (req.file) {
                // Fallback for older single file logic just in case
                const protocol = req.protocol;
                const host = req.get('host');
                const servicePrefix = process.env.SERVICE_PREFIX || '';
                imageUrl = `${protocol}://${host}${servicePrefix}/uploads/${req.file.filename}`;
            }

            if (!title || !startingPrice || !sellerId) {
                return res.status(400).json({ message: 'Title, starting price, and seller ID are required' });
            }

            const newPuja = await Puja.create(title, description, category, reservePrice, duration, mode, startingPrice, imageUrl, streamImageUrl, sellerId, 'upcoming');
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
                img: p.image_url,
                seller: p.seller_username || `User ${p.seller_id}`,
                sellerId: p.seller_id,
                sellerReputation: p.reputation_score || 0,
                sellerTotalSales: p.total_sales || 0,
                sellerImg: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80',
                category: p.category || 'General',
                currentPrice: p.current_price,
                bid: `${p.current_price}€`,
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

            // Calculate end_time based on duration
            let durationMinutes = parseInt(puja.duration) || 60;

            
            const endTime = new Date(Date.now() + durationMinutes * 60000);

            // Update to live and set end_time
            await db.query('UPDATE pujas SET status = "live", end_time = ? WHERE id = ?', [endTime, id]);
            console.log(`[Auction] Puja ${id} started (status → live, end_time → ${endTime.toISOString()})`);

            // --- NOTIFICATIONS ---
            // 1. Notify users who favorited this auction
            const favoriters = await Puja.findUsersWhoFavorited(id);
            if (favoriters.length > 0) {
                sendMassNotification(
                    favoriters,
                    '¡Subasta en directo!',
                    `La subasta "${puja.title}" acaba de empezar el live. ¡Entra ya!`,
                    'info',
                    `/auction/${id}`
                );
            }

            // 2. Notify followers of the seller
            const authUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3000';
            const internalSecret = process.env.INTERNAL_SECRET || 'bidlive_secret';
            try {
                const followersResp = await fetch(`${authUrl}/follow/internal/followers/${puja.seller_id}?secret=${internalSecret}`);
                if (followersResp.ok) {
                    const followers = await followersResp.json();
                    const followerIdsToNotify = followers
                        .map(f => f.id)
                        .filter(fid => !favoriters.includes(fid)); // Skip if already notified as favoriter

                    if (followerIdsToNotify.length > 0) {
                        sendMassNotification(
                            followerIdsToNotify,
                            `${puja.seller_username || 'Un vendedor que sigues'} está en directo`,
                            `Ha comenzado el live de "${puja.title}".`,
                            'info',
                            `/auction/${id}`
                        );
                    }
                }
            } catch (err) {
                console.error('[PujaController] Failed to fetch followers for notification:', err.message);
            }

            res.json({ message: 'Puja started', id, status: 'live', endTime });
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

            // Update seller reputation and send notifications ONLY if there is a winner
            if (winnerId) {
                try {
                    await db.query(
                        'UPDATE users SET reputation_score = reputation_score + 1, total_sales = total_sales + 1 WHERE id = ?',
                        [puja.seller_id]
                    );
                } catch (repErr) {
                    console.error('[Auction] Reputation update failed:', repErr.message);
                }

                sendNotification(
                    winnerId,
                    '¡HAS GANADO!',
                    `Has ganado la subasta "${puja.title}" por ${finalPrice || puja.current_price}€.`,
                    'success',
                    `/auction/${id}`
                );

                // --- PRIVATE CHAT SYSTEM NOTIFICATION ---
                const chatUrl = process.env.CHAT_SERVICE_URL || 'http://chat-service:3004';
                const internalSecret = process.env.INTERNAL_SECRET || 'bidlive_secret';
                try {
                    await fetch(`${chatUrl}/internal/system-message`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            secret: internalSecret,
                            winnerId: winnerId,
                            sellerId: puja.seller_id,
                            content: `¡Enhorabuena! Has ganado la subasta "${puja.title}" por ${finalPrice || puja.current_price}€. Ponte en contacto con el vendedor para finalizar los detalles del pago y envío.`
                        })
                    });
                    console.log(`[Auction] Private chat notification sent for Puja ${id}`);
                } catch (chatErr) {
                    console.error('[Auction] Failed to send private chat notification:', chatErr.message);
                }

                // Send email win confirmation email to winner
                try {
                    const [userRows] = await db.query('SELECT email FROM users WHERE id = ?', [winnerId]);
                    if (userRows.length > 0 && userRows[0].email) {
                        await sendAuctionWinEmail(userRows[0].email, puja.title, finalPrice || puja.current_price, id);
                        console.log(`[Auction] Email win confirmation triggered for winner ${winnerId}`);
                    }
                } catch (emailErr) {
                    console.error('[Auction] Failed to fetch winner email or send email:', emailErr.message);
                }
            } else {
                // No winner: Notify Seller
                sendNotification(
                    puja.seller_id,
                    'Subasta finalizada sin pujas',
                    `Tu subasta "${puja.title}" ha terminado sin recibir ninguna puja.`,
                    'info',
                    `/auction/${id}`
                );
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
            
            // SECURITY: Only the winner can pay
            if (auction.winner_id !== req.user.userId) {
                return res.status(403).json({ message: 'Solo el ganador de la subasta puede realizar el pago.' });
            }

            const price = auction.current_price || auction.starting_price;

            if (method === 'wallet') {
                const response = await fetch(`${authUrl}/wallet/pay`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: authHeader },
                    body: JSON.stringify({ amount: price, auctionId: id })
                });

                const data = await response.json();
                if (response.ok && data.success) {
                    // Trigger internal settlement
                    await pujaController._doMarkPaidAndSettlement(id);
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
                auctionId: req.params.id
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
                img: p.image_url,
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

            await pujaController._doMarkPaidAndSettlement(id);
            res.json({ success: true, message: `Auction ${id} marked as paid and seller credited.` });
        } catch (error) {
            console.error('Error in markPaid route:', error);
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    },

    _doMarkPaidAndSettlement: async (id) => {
        try {
            const puja = await Puja.findById(id);
            if (!puja) throw new Error('Puja not found');
            if (puja.payment_status === 'paid') return; // Idempotent

            await Puja.updatePaymentStatus(id, 'paid');
            console.log(`[Auction] Puja ${id} marked as paid.`);

            // SETTLEMENT: Credit the seller
            const authUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3000';
            const internalSecret = process.env.INTERNAL_SECRET || 'bidlive_secret';
            const amount = puja.current_price || puja.starting_price;

            const creditResp = await fetch(`${authUrl}/wallet/credit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: puja.seller_id,
                    amount: amount,
                    secret: internalSecret
                })
            });

            if (!creditResp.ok) {
                const errData = await creditResp.json();
                throw new Error(`Failed to credit seller: ${errData.message}`);
            }
            console.log(`[Settlement] Successfully credited ${amount} to seller ${puja.seller_id}`);
        } catch (error) {
            console.error('Error in _doMarkPaidAndSettlement:', error);
            throw error;
        }
    },

    recordBid: async (req, res) => {
        try {
            const { id } = req.params;
            const { bidderId, amount, secret } = req.body;
            
            if (secret !== (process.env.INTERNAL_SECRET || 'bidlive_secret')) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            const result = await Puja.updateBid(id, bidderId, amount);
            res.json({ success: true, previousBidderId: result.previousBidderId });
        } catch (error) {
            console.error('Error recording bid:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    extendEndTime: async (req, res) => {
        try {
            const { id } = req.params;
            const { seconds, secret } = req.body;

            if (secret !== (process.env.INTERNAL_SECRET || 'bidlive_secret')) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            await Puja.extendEndTime(id, seconds || 30);
            const puja = await Puja.findById(id);
            
            res.json({ success: true, newEndTime: puja.end_time });
        } catch (error) {
            console.error('Error extending puja time:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};

module.exports = pujaController;
