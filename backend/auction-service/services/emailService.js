const nodemailer = require('nodemailer');

/**
 * Creates a nodemailer transporter.
 * - If SMTP_USER is configured, uses those credentials.
 * - Otherwise, dynamically generates a free Ethereal test account and prints the preview URL to the console.
 */
let _transporterPromise = null;

const getTransporter = async () => {
    if (_transporterPromise) return _transporterPromise;

    _transporterPromise = (async () => {
        if (process.env.SMTP_USER) {
            // Production SMTP
            return nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'smtp.ethereal.email',
                port: Number(process.env.SMTP_PORT) || 587,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        }

        // Development fallback: auto-create an Ethereal test account
        console.log('[EmailService] No SMTP_USER set — creating Ethereal test account...');
        const testAccount = await nodemailer.createTestAccount();
        console.log(`[EmailService] Ethereal account created: ${testAccount.user}`);
        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    })();

    return _transporterPromise;
};

/**
 * Sends a win confirmation email to the highest bidder.
 * @param {string} toEmail
 * @param {string} itemName
 * @param {number} winningBid
 * @param {string|number} auctionId
 */
const sendAuctionWinEmail = async (toEmail, itemName, winningBid, auctionId) => {
    try {
        const transporter = await getTransporter();
        const appUrl = process.env.APP_URL || 'http://localhost:5173';
        const auctionLink = `${appUrl}/auction/video/${auctionId}`;

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"BidLive" <noreply@bidlive.com>',
            to: toEmail,
            subject: `¡Has ganado la subasta de ${itemName}! 🎉`,
            html: `
                <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; background: #08080f; color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid rgba(245,158,11,0.3);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 32px; text-align: center;">
                        <div style="display: inline-block; width: 56px; height: 56px; background: rgba(0,0,0,0.2); border-radius: 16px; margin-bottom: 16px; line-height: 56px; font-size: 28px;">🏆</div>
                        <h1 style="margin: 0; color: #08080f; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">¡Has Ganado!</h1>
                        <p style="margin: 8px 0 0; color: rgba(0,0,0,0.65); font-size: 15px; font-weight: 500;">Tu puja ha sido la más alta</p>
                    </div>

                    <!-- Body -->
                    <div style="padding: 32px;">
                        <p style="font-size: 16px; color: #d1d5db; margin: 0 0 24px;">¡Enhorabuena! Eres el postor ganador de la subasta:</p>

                        <div style="background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.25); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                            <p style="margin: 0 0 6px; color: #9ca3af; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Artículo</p>
                            <p style="margin: 0 0 16px; color: #ffffff; font-size: 18px; font-weight: 800;">${itemName}</p>
                            <p style="margin: 0 0 4px; color: #9ca3af; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Puja Ganadora</p>
                            <p style="margin: 0; color: #f59e0b; font-size: 32px; font-weight: 900;">${Number(winningBid).toFixed(2)}€</p>
                        </div>

                        <p style="font-size: 15px; color: #9ca3af; line-height: 1.6; margin: 0 0 28px;">Inicia sesión en tu cuenta para completar el pago y coordinar los detalles de envío con el vendedor. Tienes un chat privado abierto para comunicarte directamente.</p>

                        <div style="text-align: center;">
                            <a href="${auctionLink}"
                               style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: #08080f; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 15px; letter-spacing: 0.02em;">
                                Ver Subasta
                            </a>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="padding: 24px 32px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center;">
                        <p style="font-size: 12px; color: #4b5563; margin: 0;">Si tienes alguna pregunta, contacta con nuestro equipo de soporte.</p>
                        <p style="font-size: 12px; color: #374151; margin: 8px 0 0;">© 2025 BidLive — Subastas en Directo</p>
                    </div>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EmailService] Win email enviado a ${toEmail}. Message ID: ${info.messageId}`);

        // Print Ethereal preview URL if available (dev mode)
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log(`[EmailService] 📧 Vista previa de email (Ethereal): ${previewUrl}`);
        }

        return true;
    } catch (error) {
        console.error(`[EmailService] Error enviando email a ${toEmail}:`, error.message);
        return false;
    }
};

module.exports = {
    sendAuctionWinEmail,
};
