const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Fire-and-forget welcome email via auction-service (which has nodemailer)
const sendWelcomeEmailAsync = (email, username) => {
    const AUCTION_URL = process.env.AUCTION_SERVICE_URL || 'http://auction-service:3001';
    const INTERNAL_SECRET = process.env.INTERNAL_SECRET || 'bidlive_secret';
    fetch(`${AUCTION_URL}/internal/send-welcome-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, secret: INTERNAL_SECRET })
    }).catch(err => console.error('[Auth] Welcome email request failed:', err.message));
};

const authController = {
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      await User.create(username, email, password);

      // Fire-and-forget: send welcome email without blocking the response
      sendWelcomeEmailAsync(email, username);

      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await User.validatePassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "7d" },
      );

      const { password: _, ...userWithoutPassword } = user;
      res.json({
        token,
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  googleLogin: async (req, res) => {
    try {
      const { token: googleToken } = req.body;
      if (!googleToken) {
        return res.status(400).json({ message: "Google token is required" });
      }

      const GOOGLE_ID = process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE";
      if (GOOGLE_ID.includes("YOUR_GOOGLE_CLIENT_ID_HERE")) {
        console.error("❌ Google Login attempted but GOOGLE_CLIENT_ID is not configured in backend.");
        return res.status(503).json({ message: "Google Login is currently unavailable (not configured)" });
      }

      // Verify Google token
      const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: GOOGLE_ID,
      });
      const payload = ticket.getPayload();
      const email = payload.email;
      const username = payload.name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 10000);

      let user = await User.findByEmail(email);

      // Create new user if not exists
      if (!user) {
        // Random long password for Google users
        const randomPassword = require('crypto').randomBytes(16).toString('hex');
        await User.create(username, email, randomPassword);
        user = await User.findByEmail(email);
        // Fire-and-forget: send welcome email to new Google users
        sendWelcomeEmailAsync(email, username);
      }

      // Generate app JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      const { password: _, ...userWithoutPassword } = user;
      res.json({
        token,
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error("Google Login error:", error);
      res.status(500).json({ message: "Internal server error during Google login" });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { id } = req.params;
      const { username, bio, avatar_url, billing_address, payment_method } = req.body;
      await User.updateFullProfile(id, { username, bio, avatar_url, billing_address, payment_method });
      const updatedUser = await User.findById(id);

      res.json({
        message: "Profile updated successfully",
        user: updatedUser
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  uploadAvatar: async (req, res) => {
    try {
      // Use the authenticated userId from the JWT token (set by authMiddleware)
      // Fall back to the URL param only as a secondary option
      const id = (req.user && req.user.userId) ? req.user.userId : req.params.id;

      console.log(`[uploadAvatar] userId from token: ${req.user?.userId}, param id: ${req.params.id}, using: ${id}`);

      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Build the public URL — use X-Forwarded-* headers when behind nginx
      const proto = req.get("X-Forwarded-Proto") || req.protocol;
      const host = req.get("X-Forwarded-Host") || req.get("host");
      const avatarUrl = `${proto}://${host}/auth/uploads/avatars/${req.file.filename}`;

      console.log(`[uploadAvatar] saved: ${req.file.filename} → ${avatarUrl}`);

      // Persist in DB
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ message: "User not found" });

      await User.updateFullProfile(id, {
        username: user.username,
        avatar_url: avatarUrl,
        billing_address: user.billing_address,
        payment_method: user.payment_method,
      });

      const updatedUser = await User.findById(id);
      res.json({
        message: "Avatar updated successfully",
        filename: req.file.filename,
        user: updatedUser,
      });
    } catch (error) {
      console.error("Upload avatar error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = authController;
