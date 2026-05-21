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
            console.log(`[EmailService] ✅ Using production SMTP: ${process.env.SMTP_HOST || 'smtp configured'} (user: ${process.env.SMTP_USER})`);
            // Production SMTP
            return nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'smtp.ethereal.email',
                port: Number(process.env.SMTP_PORT) || 587,
                secure: Number(process.env.SMTP_PORT) === 465,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        }

        // Development fallback: auto-create an Ethereal test account
        console.warn('[EmailService] ⚠️  SMTP_USER not set — using Ethereal test account.');
        console.warn('[EmailService] ⚠️  Emails will NOT be delivered to real inboxes!');
        console.warn('[EmailService] ⚠️  To enable real email, set in .env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM');
        const testAccount = await nodemailer.createTestAccount();
        console.log(`[EmailService] Ethereal account created: ${testAccount.user}`);
        console.log(`[EmailService] Preview emails at: https://ethereal.email/messages (login: ${testAccount.user} / ${testAccount.pass})`);
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

// BidLive logo as inline HTML (no external image, works in all email clients)
const BIDLIVE_LOGO_HTML = `
    <div style="display:inline-flex;align-items:center;gap:6px;margin-bottom:12px;">
        <div style="width:36px;height:36px;background:#f59e0b;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;">
            <span style="color:#08080f;font-weight:900;font-size:18px;line-height:1;">B</span>
        </div>
        <span style="font-size:22px;font-weight:900;color:#08080f;letter-spacing:-0.5px;">Bid<span style="color:rgba(0,0,0,0.6);">Live</span></span>
    </div>
`;

/**
 * Sends a win confirmation email to the highest bidder.
 * @param {string} toEmail
 * @param {string} itemName
 * @param {number} winningBid
 * @param {string|number} auctionId
 * @param {string|null} conversationId - ID of the chat conversation between winner and seller
 */
const sendAuctionWinEmail = async (toEmail, itemName, winningBid, auctionId, conversationId = null) => {
    try {
        const transporter = await getTransporter();
        const appUrl = process.env.APP_URL || 'http://localhost:5173';
        // Link to the specific conversation if available, otherwise to the messages inbox
        const chatLink = conversationId ? `${appUrl}/messages/${conversationId}` : `${appUrl}/messages`;

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"BidLive" <noreply@bidlive.com>',
            to: toEmail,
            subject: `¡Has ganado la subasta de ${itemName}! 🎉`,
            html: `
                <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#08080f;color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid rgba(245,158,11,0.3);">
                    <!-- Header -->
                    <div style="background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);padding:32px;text-align:center;">
                        ${BIDLIVE_LOGO_HTML}
                        <div style="width:56px;height:56px;background:rgba(0,0,0,0.2);border-radius:16px;margin:8px auto 16px;line-height:56px;font-size:28px;">🏆</div>
                        <h1 style="margin:0;color:#08080f;font-size:26px;font-weight:900;letter-spacing:-0.5px;">¡Has Ganado!</h1>
                        <p style="margin:8px 0 0;color:rgba(0,0,0,0.65);font-size:14px;font-weight:500;">Tu puja ha sido la más alta</p>
                    </div>

                    <!-- Body -->
                    <div style="padding:32px;">
                        <p style="font-size:15px;color:#d1d5db;margin:0 0 20px;">¡Enhorabuena! Eres el postor ganador de la subasta:</p>

                        <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);border-radius:12px;padding:20px;margin-bottom:24px;">
                            <p style="margin:0 0 4px;color:#9ca3af;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">Artículo</p>
                            <p style="margin:0 0 16px;color:#ffffff;font-size:17px;font-weight:800;">${itemName}</p>
                            <p style="margin:0 0 4px;color:#9ca3af;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">Puja Ganadora</p>
                            <p style="margin:0;color:#f59e0b;font-size:30px;font-weight:900;">${Number(winningBid).toFixed(2)}€</p>
                        </div>

                        <p style="font-size:14px;color:#9ca3af;line-height:1.6;margin:0 0 24px;">Tu conversación privada con el vendedor está lista. Coordina allí los detalles del envío y confirma el pago.</p>

                        <div style="text-align:center;">
                            <a href="${chatLink}"
                               style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);color:#08080f;padding:14px 32px;text-decoration:none;border-radius:12px;font-weight:900;font-size:14px;letter-spacing:0.02em;">
                                💬 Ver mi conversación con el vendedor
                            </a>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
                        <p style="font-size:12px;color:#4b5563;margin:0;">Si tienes alguna pregunta, contacta con nuestro equipo de soporte.</p>
                        <p style="font-size:12px;color:#374151;margin:6px 0 0;">© 2025 BidLive — Subastas en Directo</p>
                    </div>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EmailService] Win email sent to ${toEmail}. Message ID: ${info.messageId}`);

        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log(`[EmailService] 📧 Vista previa de email (Ethereal): ${previewUrl}`);
        }

        return true;
    } catch (error) {
        console.error(`[EmailService] Error sending win email to ${toEmail}:`, error.message);
        return false;
    }
};

/**
 * Sends a welcome email to a newly registered user.
 * @param {string} toEmail
 * @param {string} username
 */
const sendWelcomeEmail = async (toEmail, username) => {
    try {
        const transporter = await getTransporter();
        const appUrl = process.env.APP_URL || 'http://localhost:5173';

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"BidLive" <noreply@bidlive.com>',
            to: toEmail,
            subject: `¡Bienvenido/a a BidLive, ${username}! 🎉`,
            html: `
                <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#08080f;color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid rgba(245,158,11,0.2);">
                    <!-- Header -->
                    <div style="background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);padding:32px;text-align:center;">
                        ${BIDLIVE_LOGO_HTML}
                        <h1 style="margin:8px 0 0;color:#08080f;font-size:24px;font-weight:900;">¡Bienvenido/a, ${username}!</h1>
                        <p style="margin:8px 0 0;color:rgba(0,0,0,0.65);font-size:14px;">Tu cuenta en BidLive ya está activa</p>
                    </div>

                    <!-- Body -->
                    <div style="padding:32px;">
                        <p style="font-size:15px;color:#d1d5db;line-height:1.6;margin:0 0 24px;">
                            BidLive es la plataforma de <strong style="color:#f59e0b;">subastas en directo</strong> donde puedes pujar en tiempo real, descubrir artículos únicos y vender lo que ya no necesitas a miles de compradores activos.
                        </p>

                        <!-- Steps -->
                        <div style="display:grid;gap:12px;margin-bottom:28px;">
                            <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;display:flex;align-items:center;gap:12px;">
                                <span style="font-size:24px;">🔍</span>
                                <div>
                                    <p style="margin:0;font-weight:700;color:#fff;font-size:14px;">Explora subastas</p>
                                    <p style="margin:4px 0 0;color:#9ca3af;font-size:12px;">Descubre artículos en directo y únete a las pujas</p>
                                </div>
                            </div>
                            <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;display:flex;align-items:center;gap:12px;">
                                <span style="font-size:24px;">👤</span>
                                <div>
                                    <p style="margin:0;font-weight:700;color:#fff;font-size:14px;">Completa tu perfil</p>
                                    <p style="margin:4px 0 0;color:#9ca3af;font-size:12px;">Añade tu foto y dirección para comprar y vender</p>
                                </div>
                            </div>
                            <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;display:flex;align-items:center;gap:12px;">
                                <span style="font-size:24px;">💰</span>
                                <div>
                                    <p style="margin:0;font-weight:700;color:#fff;font-size:14px;">Recarga tu monedero</p>
                                    <p style="margin:4px 0 0;color:#9ca3af;font-size:12px;">Añade fondos para empezar a pujar de inmediato</p>
                                </div>
                            </div>
                        </div>

                        <!-- CTAs -->
                        <div style="text-align:center;display:flex;flex-direction:column;gap:12px;">
                            <a href="${appUrl}/explore"
                               style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);color:#08080f;padding:14px 32px;text-decoration:none;border-radius:12px;font-weight:900;font-size:14px;">
                                🔍 Explorar subastas
                            </a>
                            <a href="${appUrl}/profile"
                               style="display:inline-block;background:rgba(255,255,255,0.08);color:#ffffff;padding:14px 32px;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px;border:1px solid rgba(255,255,255,0.15);">
                                👤 Completar mi perfil
                            </a>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
                        <p style="font-size:12px;color:#4b5563;margin:0;">¿Necesitas ayuda? Contacta con nuestro soporte.</p>
                        <p style="font-size:12px;color:#374151;margin:6px 0 0;">© 2025 BidLive — Subastas en Directo</p>
                    </div>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EmailService] Welcome email sent to ${toEmail}. Message ID: ${info.messageId}`);

        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log(`[EmailService] 📧 Vista previa welcome (Ethereal): ${previewUrl}`);
        }

        return true;
    } catch (error) {
        console.error(`[EmailService] Welcome email failed for ${toEmail}:`, error.message);
        return false;
    }
};

/**
 * Sends a password reset email with a one-time link.
 * @param {string} toEmail
 * @param {string} username
 * @param {string} resetToken - The secure reset token
 * @param {string} resetUrl  - Full URL to the reset page (includes token)
 */
const sendPasswordResetEmail = async (toEmail, username, resetToken, resetUrl) => {
    try {
        const transporter = await getTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"BidLive" <noreply@bidlive.com>',
            to: toEmail,
            subject: 'Restablece tu contraseña — BidLive',
            html: `
                <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#08080f;color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid rgba(245,158,11,0.2);">
                    <!-- Header -->
                    <div style="background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);padding:32px;text-align:center;">
                        ${BIDLIVE_LOGO_HTML}
                        <div style="width:48px;height:48px;background:rgba(0,0,0,0.2);border-radius:14px;margin:8px auto 16px;line-height:48px;font-size:24px;">🔒</div>
                        <h1 style="margin:0;color:#08080f;font-size:22px;font-weight:900;">Restablecer contraseña</h1>
                        <p style="margin:8px 0 0;color:rgba(0,0,0,0.65);font-size:13px;">Has solicitado un enlace de recuperación</p>
                    </div>

                    <!-- Body -->
                    <div style="padding:32px;">
                        <p style="font-size:15px;color:#d1d5db;margin:0 0 8px;">Hola, <strong style="color:#fff;">${username || 'usuario'}</strong></p>
                        <p style="font-size:14px;color:#9ca3af;line-height:1.6;margin:0 0 24px;">
                            Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en BidLive.
                            Haz clic en el botón de abajo para crear una nueva contraseña. Este enlace es válido durante <strong style="color:#f59e0b;">1 hora</strong>.
                        </p>

                        <div style="text-align:center;margin-bottom:24px;">
                            <a href="${resetUrl}"
                               style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);color:#08080f;padding:14px 32px;text-decoration:none;border-radius:12px;font-weight:900;font-size:14px;letter-spacing:0.02em;">
                                🔑 Restablecer contraseña
                            </a>
                        </div>

                        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:14px;margin-bottom:20px;">
                            <p style="margin:0 0 6px;font-size:11px;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">O copia este enlace en tu navegador:</p>
                            <p style="margin:0;font-size:11px;color:#f59e0b;word-break:break-all;">${resetUrl}</p>
                        </div>

                        <p style="font-size:12px;color:#6b7280;line-height:1.5;margin:0;">
                            Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña no cambiará.
                        </p>
                    </div>

                    <!-- Footer -->
                    <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
                        <p style="font-size:12px;color:#4b5563;margin:0;">Este enlace expirará en 1 hora por razones de seguridad.</p>
                        <p style="font-size:12px;color:#374151;margin:6px 0 0;">&copy; 2025 BidLive &mdash; Subastas en Directo</p>
                    </div>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EmailService] Password reset email sent to ${toEmail}. Message ID: ${info.messageId}`);

        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log(`[EmailService] 📧 Vista previa reset (Ethereal): ${previewUrl}`);
        }

        return true;
    } catch (error) {
        console.error(`[EmailService] Password reset email failed for ${toEmail}:`, error.message);
        return false;
    }
};

module.exports = {
    sendAuctionWinEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
};
