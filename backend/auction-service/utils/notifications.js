/**
 * Sends a notification to a specific user via Bidding Service (for real-time WS)
 * and Auth Service (for persistence).
 */
const sendNotification = async (userId, title, message, type = 'info', link = null) => {
    try {
        const BIDDING_SERVICE_URL = process.env.BIDDING_SERVICE_URL || 'http://bidding-service:3002';
        const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3000';
        const INTERNAL_SECRET = process.env.INTERNAL_SECRET || 'bidlive_secret';

        // 1. Persistence in Auth Service
        await fetch(`${AUTH_URL}/notifications/internal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                internal_secret: INTERNAL_SECRET,
                user_id: userId,
                title,
                message,
                type,
                link
            })
        });

        // 2. Real-time delivery via Bidding Service
        await fetch(`${BIDDING_SERVICE_URL}/notify-user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                payload: {
                    title,
                    message,
                    type,
                    link,
                    timestamp: new Date().toISOString()
                },
                secret: INTERNAL_SECRET
            })
        });

    } catch (err) {
        console.error('[NotificationUtil] Failed to send notification:', err.message);
    }
};

/**
 * Sends a notification to multiple users at once.
 */
const sendMassNotification = async (userIds, title, message, type = 'info', link = null) => {
    if (!userIds || userIds.length === 0) return;
    
    try {
        const BIDDING_SERVICE_URL = process.env.BIDDING_SERVICE_URL || 'http://bidding-service:3002';
        const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3000';
        const INTERNAL_SECRET = process.env.INTERNAL_SECRET || 'bidlive_secret';

        // 1. Persistence (sequential for now, but we should ideally have a bulk endpoint in auth too)
        // For simplicity, we'll loop, but in production we'd want /notifications/internal/bulk
        for (const userId of userIds) {
            fetch(`${AUTH_URL}/notifications/internal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    internal_secret: INTERNAL_SECRET,
                    user_id: userId,
                    title,
                    message,
                    type,
                    link
                })
            }).catch(e => console.error(`[NotificationUtil] Persistence failed for user ${userId}:`, e.message));
        }

        // 2. Real-time delivery (bulk)
        await fetch(`${BIDDING_SERVICE_URL}/notify-users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userIds,
                payload: {
                    title,
                    message,
                    type,
                    link,
                    timestamp: new Date().toISOString()
                },
                secret: INTERNAL_SECRET
            })
        });

    } catch (err) {
        console.error('[NotificationUtil] Failed to send mass notification:', err.message);
    }
};

module.exports = { sendNotification, sendMassNotification };
