require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const authController = require("./controllers/authController");
const paymentController = require("./controllers/paymentController");
const profileController = require("./controllers/profileController");
const notificationController = require("./controllers/notificationController");
const followerController = require("./controllers/followerController");
const User = require("./models/User");
const Notification = require("./models/Notification");
const Follower = require("./models/Follower");
const authMiddleware = require("./middleware/authMiddleware");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const OpenApiValidator = require("express-openapi-validator");

const app = express();
const port = process.env.PORT || 3000;

// Load OpenAPI spec robustly
const specPath = process.env.OPENAPI_SPEC_PATH || path.join(__dirname, "../../openspec/specs/auth-spec.yaml");
let openApiSpec = null;
if (fs.existsSync(specPath)) {
  try {
    openApiSpec = YAML.load(specPath);
  } catch (err) {
    console.warn(`[Warning] Could not parse OpenAPI spec at ${specPath}:`, err.message);
  }
} else {
  console.warn(`[Warning] OpenAPI spec not found at ${specPath}. Swagger UI and validation disabled.`);
}


// Webhook must be before express.json() to get raw body
app.post("/webhook", express.raw({ type: "application/json" }), paymentController.webhook);

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Serve uploaded avatars as static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── OpenAPI / Swagger ────────────────────────────────────────────────────────
if (openApiSpec) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

  app.use(
    OpenApiValidator.middleware({
      apiSpec: specPath,
      validateRequests: true,
      validateResponses: false, // Set to true if you want to strictly validate responses too
      ignorePaths: (path) => path.includes("/webhook") || path.includes("/uploads"),
    }),
  );
}

// ── Avatar uploads ──────────────────────────────────────────────────────────
const avatarDir = path.join(__dirname, "uploads", "avatars");
if (!fs.existsSync(avatarDir)) fs.mkdirSync(avatarDir, { recursive: true });

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `avatar-${unique}${path.extname(file.originalname)}`);
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images are allowed"));
  },
});

// Serve avatar files statically
app.use(
  "/uploads/avatars",
  express.static(avatarDir)
);

// ── Initialize DB ────────────────────────────────────────────────────────────
const initDB = async (retries = 5, delay = 5000) => {
  console.log(`[AuthService] Starting DB initialization... (DB_HOST: ${process.env.DB_HOST || 'localhost'})`);
  for (let i = 0; i < retries; i++) {
    try {
      await User.createTable();
      console.log("✅ Users table checked/created successfully");
      await Notification.createTable();
      console.log("✅ Notifications table checked/created successfully");
      await Follower.createTable();
      console.log("✅ Followers table checked/created successfully");
      
      console.log("🚀 Database initialization complete for Auth Service");
      return true;
    } catch (err) {
      console.error(`❌ Error initializing database (attempt ${i + 1}/${retries}):`, err.message);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }
  return false;
};

// ── Routes ───────────────────────────────────────────────────────────────────
app.post("/register", authController.register);
app.post("/login", authController.login);
app.post("/google", authController.googleLogin);

// Wallet routes
app.post("/wallet/recharge", authMiddleware, paymentController.createCheckoutSession);
app.post("/wallet/pay", authMiddleware, paymentController.payWithWallet);
app.get("/wallet/balance", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ wallet: user.wallet_balance ?? 0, balance: user.wallet_balance ?? 0 });
  } catch (err) {
    console.error("Get balance error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/wallet/balance/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { secret } = req.query;
    if (secret !== (process.env.INTERNAL_SECRET || "bidlive_secret")) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ balance: user.wallet_balance ?? 0 });
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});
app.post("/wallet/credit", paymentController.creditWallet);
app.post("/wallet/debit", paymentController.internalDebitWallet);

// Profile routes
app.get("/profile/search", profileController.searchUsers);
app.get("/profile/:id", profileController.getProfile);
app.put("/profile/:id", authMiddleware, authController.updateProfile);
app.put("/profile", authMiddleware, profileController.updateProfile);
app.post("/profile/avatar", authMiddleware, ...profileController.uploadAvatar);

// Payment routes
app.post("/payment/create-checkout-session", authMiddleware, paymentController.createCheckoutSession);
app.get("/payment/confirm-session/:sessionId", paymentController.confirmSession);
app.post("/payment/webhook", paymentController.webhook);

// Avatar upload: POST /auth/profile/:id/avatar  (multipart, field = "avatar")
// Avatar upload: POST /auth/profile/:id/avatar  (multipart, field = "avatar")
app.post(
  "/profile/:id/avatar",
  authMiddleware,
  uploadAvatar.single("avatar"),
  authController.uploadAvatar
);

// Notification routes
app.get("/notifications", authMiddleware, notificationController.getNotifications);
app.post("/notifications/:id/read", authMiddleware, notificationController.markAsRead);
app.post("/notifications/read-all", authMiddleware, notificationController.markAllAsRead);
app.post("/notifications/internal", notificationController.createInternal);

// Follower routes
app.post("/follow/toggle", authMiddleware, followerController.toggleFollow);
app.get("/follow/check/:sellerId", authMiddleware, followerController.checkFollowing);
app.get("/follow/stats/:userId", followerController.getStats);
app.get("/follow/internal/followers/:sellerId", followerController.getInternalFollowers);

app.get("/", (_req, res) => res.send("Auth Service is running"));

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  if (err.message === "Only images are allowed") {
    return res.status(400).json({ message: err.message });
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// ── Boot ─────────────────────────────────────────────────────────────────────
(async () => {
  const ok = await initDB();
  if (!ok) process.exit(1);
  app.listen(port, () =>
    console.log(`Auth Service listening on port ${port}`)
  );
})();
