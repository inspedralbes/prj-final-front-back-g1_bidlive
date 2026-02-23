const express = require("express");
const authController = require("./controllers/authController");
const User = require("./models/User");

const app = express();
const port = process.env.PORT || 3000;

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
