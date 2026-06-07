const Puja = require('../models/Puja');
const db = require('../config/db');
const { sendNotification } = require('../utils/notifications');
const { sendAuctionWinEmail } = require('./emailService');

const checkExpiredAuctions = async () => {
    try {
        const expired = await Puja.findExpired();
        
        for (const auction of expired) {
            console.log(`[ClosureWorker] Closing auction ${auction.id}...`);
            
            // Declare winner (the last_bidder_id)
            const winnerId = auction.last_bidder_id;
            const finalPrice = auction.current_price;
            
            await Puja.endWithWinner(auction.id, winnerId, finalPrice);
            
            // --- Instant Settlement (New US-21-B logic) ---
            if (winnerId) {
                try {
                    const authUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3000';
                    const internalSecret = process.env.INTERNAL_SECRET || 'bidlive_secret';

                    // 1. Debit the winner
                    const debitResp = await fetch(`${authUrl}/wallet/debit`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: winnerId, amount: finalPrice, secret: internalSecret })
                    });

                    if (debitResp.ok) {
                        // 2. Credit the seller
                        await fetch(`${authUrl}/wallet/credit`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId: auction.seller_id, amount: finalPrice, secret: internalSecret })
                        });

                        // 3. Update auction payment status
                        await Puja.updatePaymentStatus(auction.id, 'paid');
                        console.log(`[ClosureWorker] Instant settlement successful for auction ${auction.id}.`);

                        // 4. Update seller reputation
                        await db.query(
                            'UPDATE users SET reputation_score = reputation_score + 1, total_sales = total_sales + 1 WHERE id = ?',
                            [auction.seller_id]
                        );

                        // 5. Notify Winner (Paid)
                        sendNotification(
                            winnerId,
                            '¡Has ganado y pagado con éxito!',
                            `Felicidades, has ganado "${auction.title}" por ${finalPrice}€. El pago se ha descontado de tu billetera automáticamente.`,
                            'success',
                            `/auction/${auction.id}`
                        );

                        // 6. Send Email Notification
                        try {
                            const [userRows] = await db.query('SELECT email FROM users WHERE id = ?', [winnerId]);
                            if (userRows.length > 0 && userRows[0].email) {
                                sendAuctionWinEmail(userRows[0].email, auction.title, finalPrice, auction.id);
                            }
                        } catch (emailErr) {
                            console.error('[ClosureWorker] Failed to fetch user email or send email:', emailErr.message);
                        }
                    } else {
                        const debitData = await debitResp.json();
                        console.error(`[ClosureWorker] Instant settlement failed (Insufficient funds) for winner ${winnerId}:`, debitData.message);

                        // Fallback: Cancel auction and penalize
                        await Puja.cancelForNonPayment(auction.id);
                        await db.query('UPDATE users SET reputation_score = reputation_score - 10 WHERE id = ?', [winnerId]);

                        sendNotification(
                            winnerId,
                            'Subasta cancelada: Saldo insuficiente',
                            `Has ganado la subasta "${auction.title}", pero no tenías saldo suficiente para completar el pago automático. Tu reputación ha sido penalizada.`,
                            'error',
                            `/auction/${auction.id}`
                        );

                        sendNotification(
                            auction.seller_id,
                            'Venta fallida: Comprador sin saldo',
                            `La venta de "${auction.title}" ha fallado porque el comprador no tenía saldo suficiente. La subasta ha sido cancelada.`,
                            'error',
                            `/auction/${auction.id}`
                        );
                    }
                } catch (settleErr) {
                    console.error('[ClosureWorker] Settlement logic failed:', settleErr.message);
                }
            } else {
                // No winner: Notify Seller
                sendNotification(
                    auction.seller_id,
                    'Subasta finalizada sin pujas',
                    `Tu subasta "${auction.title}" ha terminado sin recibir ninguna puja.`,
                    'info',
                    `/auction/${auction.id}`
                );
            }

            // Inject chat message
            try {
                const BIDDING_SERVICE_URL = process.env.BIDDING_SERVICE_URL || 'http://bidding-service:3002';
                const INTERNAL_SECRET = process.env.INTERNAL_SECRET || 'bidlive_secret';
                
                let chatMessage = winnerId 
                    ? `🎉 ¡Subasta finalizada! Se ha adjudicado por ${finalPrice}€.`
                    : `🛑 Subasta finalizada sin ganador.`;

                await fetch(`${BIDDING_SERVICE_URL}/inject-chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        auctionId: auction.id.toString(),
                        message: chatMessage,
                        username: 'Sistema BidLive',
                        senderId: 'system',
                        secret: INTERNAL_SECRET
                    })
                });
            } catch (chatErr) {
                console.error('[ClosureWorker] Failed to inject chat message:', chatErr.message);
            }

            // Notify Bidding Service to broadcast AUCTION_ENDED
            try {
                const BIDDING_SERVICE_URL = process.env.BIDDING_SERVICE_URL || 'http://bidding-service:3002';
                const INTERNAL_SECRET = process.env.INTERNAL_SECRET || 'bidlive_secret';

                // Fetch winner username if there is a winner
                let winnerUsername = null;
                if (winnerId) {
                    try {
                        const [userRows] = await db.query('SELECT username FROM users WHERE id = ?', [winnerId]);
                        winnerUsername = userRows[0]?.username || null;
                    } catch (_) {}
                }

                await fetch(`${BIDDING_SERVICE_URL}/broadcast`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        auctionId: auction.id.toString(),
                        type: 'AUCTION_ENDED',
                        payload: { winnerId, winnerUsername, finalPrice, auctionId: auction.id },
                        secret: INTERNAL_SECRET
                    })
                });
            } catch (broadcastErr) {
                console.error('[ClosureWorker] Failed to notify bidding-service:', broadcastErr.message);
            }
        }
    } catch (error) {
        console.error('[ClosureWorker] Error checking expired auctions:', error);
    }
};

const startClosureWorker = (intervalMs = 5000) => {
    console.log(`[ClosureWorker] Started with interval ${intervalMs}ms`);
    setInterval(checkExpiredAuctions, intervalMs);
};

module.exports = { startClosureWorker };
