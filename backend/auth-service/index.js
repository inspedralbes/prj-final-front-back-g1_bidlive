require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const authController = require("./controllers/authController");
const profileController = require("./controllers/profileController");
const paymentController = require("./controllers/paymentController");
const authMiddleware = require("./authMiddleware");
const User = require("./models/User");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Serve uploaded avatars as static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
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
  for (let i = 0; i < retries; i++) {
    try {
      await User.createTable();
      console.log("✅ Users table checked/created successfully");
      return true;
    } catch (err) {
      console.error(`❌ Error creating users table (attempt ${i + 1}/${retries}):`, err);
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

// Profile routes
app.get("/profile/:id", profileController.getProfile);
app.put("/profile/:id", authMiddleware, authController.updateProfile); // Usar el del authController o profileController según corresponda
app.put("/profile", authMiddleware, profileController.updateProfile);
app.post("/profile/avatar", authMiddleware, ...profileController.uploadAvatar);

// Payment routes
app.post("/payment/create-checkout-session", authMiddleware, paymentController.createCheckoutSession);
app.get("/payment/confirm-session/:sessionId", paymentController.confirmSession);
app.post("/payment/webhook", paymentController.webhook);

// Avatar upload: POST /auth/profile/:id/avatar  (multipart, field = "avatar")
app.post(
  "/profile/:id/avatar",
  uploadAvatar.single("avatar"),
  authController.uploadAvatar
);

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
