const express = require("express");
const path = require("path");
const authController = require("./controllers/authController");
const profileController = require("./controllers/profileController");
const authMiddleware = require("./authMiddleware");
const User = require("./models/User");

const app = express();
const port = process.env.PORT || 3000;

// IMPORTANTE: Quitamos app.use(cors()) de aquí porque lo gestionará el Gateway
app.use(express.json());

// Serve uploaded avatars as static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

// Auth routes (Nginx strips /auth prefix)
app.post("/register", authController.register);
app.post("/login", authController.login);

// Profile routes
app.get("/profile/:id", profileController.getProfile);
app.put("/profile", authMiddleware, profileController.updateProfile);
app.post("/profile/avatar", authMiddleware, ...profileController.uploadAvatar);

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
