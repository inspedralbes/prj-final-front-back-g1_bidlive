const Stripe = require("stripe");
// Lazily get stripe so missing key doesn't crash at load time
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not configured");
  return Stripe(process.env.STRIPE_SECRET_KEY);
};
const User = require("../models/User");

const paymentController = {
  createCheckoutSession: async (req, res) => {
    try {
      const { amount, auctionId } = req.body;
      const userId = req.user.userId;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const session = await getStripe().checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: "Recarga de Billetera BidLive",
                description: `Recarga de ${amount}€ para tu cuenta de BidLive`,
              },
              unit_amount: Math.round(amount * 100), // En céntimos
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/profile?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/profile?payment=cancel`,
        metadata: {
          userId: userId.toString(),
          auctionId: auctionId ? auctionId.toString() : "",
        },
      });

      res.json({ id: session.id, url: session.url });
    } catch (err) {
      console.error("DETAILED STRIPE ERROR:", {
        message: err.message,
        type: err.type,
        code: err.code,
        param: err.param
      });
      res.status(500).json({
        message: "Error de Stripe",
        error: err.message
      });
    }
  },

  confirmSession: async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await getStripe().checkout.sessions.retrieve(sessionId);

      if (session.payment_status === "paid") {
        const userId = session.metadata.userId;
        const auctionId = session.metadata.auctionId;
        const amount = session.amount_total / 100;

        if (!auctionId) {
          await User.addMoney(userId, amount);
        }

        res.json({ success: true, amount, balance: amount, wallet: amount }); // Simplificado
      } else {
        res.status(400).json({ success: false, message: "Payment not completed" });
      }
    } catch (err) {
      console.error("Confirm session error:", err);
      res.status(500).json({ message: "Error al confirmar pago" });
    }
  },

  webhook: async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = getStripe().webhooks.constructEvent(
        req.rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata.userId;
      const auctionId = session.metadata.auctionId;
      const amount = session.amount_total / 100; // Volver a euros

      try {
        if (!auctionId) {
          await User.addMoney(userId, amount);
          console.log(`✅ Success: Wallet of user ${userId} updated with ${amount}€`);
        } else {
          console.log(`✅ Success: Auction ${auctionId} paid via Stripe by user ${userId}`);
          // Notify auction service
          const auctionUrl = process.env.AUCTION_SERVICE_URL || 'http://auction-service:3001';
          await fetch(`${auctionUrl}/pujas/${auctionId}/mark-paid`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ secret: process.env.INTERNAL_SECRET || 'bidlive_secret' })
          });
        }
      } catch (err) {
        console.error("Database update error in webhook:", err);
        return res.status(500).send("Database error");
      }
    }

    res.json({ received: true });
  },

  payWithWallet: async (req, res) => {
    try {
      const { amount } = req.body;
      const userId = req.user.userId;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Importe inválido" });
      }

      const success = await User.subtractMoney(userId, amount);
      if (success) {
        res.json({ success: true, message: "Pago realizado con éxito desde la billetera" });
      } else {
        res.status(400).json({ success: false, message: "Saldo insuficiente en la billetera" });
      }
    } catch (err) {
      console.error("Pay with wallet error:", err);
      res.status(500).json({ message: "Error al procesar el pago con billetera" });
    }
  },
};

module.exports = paymentController;
