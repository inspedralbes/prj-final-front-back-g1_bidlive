const nodemailer = require('nodemailer');

// Configure transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Sends a win confirmation email to the highest bidder
 * @param {string} toEmail 
 * @param {string} itemName 
 * @param {number} winningBid 
 * @param {string} auctionId 
 */
const sendAuctionWinEmail = async (toEmail, itemName, winningBid, auctionId) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"BidLive" <noreply@bidlive.com>',
            to: toEmail,
            subject: `You won the auction for ${itemName}! 🎉`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #2c3e50; text-align: center;">Congratulations! You Won!</h2>
                    <p style="font-size: 16px; color: #333;">Hello,</p>
                    <p style="font-size: 16px; color: #333;">Great news! You are the winning bidder for the auction: <strong>${itemName}</strong>.</p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Auction ID:</strong> ${auctionId}</p>
                        <p style="margin: 5px 0;"><strong>Item Name:</strong> ${itemName}</p>
                        <p style="margin: 5px 0; font-size: 18px; color: #27ae60;"><strong>Winning Bid:</strong> $${winningBid.toFixed(2)}</p>
                    </div>
                    <p style="font-size: 16px; color: #333;">Please log in to your account to complete the payment and arrange for shipping.</p>
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="http://localhost:5173/auctions/${auctionId}" style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Auction Details</a>
                    </div>
                    <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                    <p style="font-size: 12px; color: #7f8c8d; text-align: center;">If you have any questions, please contact our support team.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email Service] Auction win email sent to ${toEmail}. Message ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`[Email Service] Error sending email to ${toEmail}:`, error);
        return false;
    }
};

module.exports = {
    sendAuctionWinEmail
};
