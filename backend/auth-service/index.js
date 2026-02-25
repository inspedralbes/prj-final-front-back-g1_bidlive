require("dotenv").config();
const express = require("express");
const authController = require("./controllers/authController");
const walletController = require("./controllers/walletController");
const User = require("./models/User");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();
const port = process.env.PORT || 3000;

// Webhook must be before express.json() to get raw body
app.post("/webhook", express.raw({ type: "application/json" }), walletController.handleWebhook);

// IMPORTANTE: Quitamos app.use(cors()) de aquí porque lo gestionará el Gateway
app.use(express.json());

// Initialize Database Table with Retry Logic
const initDB = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await User.createTable();
      console.log("✅ Users table checked/created successfully");
      return true;
    } catch (err) {
      console.error(
        `❌ Error creating users table (attempt ${i + 1}/${retries}):`,
        err,
      );
      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }
  return false;
};

// Routes directas (Nginx se encarga del prefijo /auth)
app.post("/register", authController.register);
app.post("/login", authController.login);

// Wallet routes
app.post("/wallet/recharge", authMiddleware, walletController.createRechargeSession);
app.get("/wallet/balance", authMiddleware, walletController.getBalance);

app.get("/", (req, res) => {
  res.send("Auth Service is running");
});

(async () => {
  const ok = await initDB();
  if (!ok) process.exit(1);
  app.listen(port, () => {
    console.log(`Auth Service listening on port ${port}`);
  });
})();
