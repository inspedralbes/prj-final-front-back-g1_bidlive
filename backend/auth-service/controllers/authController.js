const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

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
        { expiresIn: "1h" },
      );

      res.json({
        token,
        user: { id: user.id, username: user.username, email: user.email, avatar_url: user.avatar_url, billing_address: user.billing_address, payment_method: user.payment_method },
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

      // Verify Google token
      const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE",
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
      }

      // Generate app JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({
        token,
        user: { id: user.id, username: user.username, email: user.email, avatar_url: user.avatar_url, billing_address: user.billing_address, payment_method: user.payment_method },
      });
    } catch (error) {
      console.error("Google Login error:", error);
      res.status(500).json({ message: "Internal server error during Google login" });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { id } = req.params;
      const { username, avatar_url, billing_address, payment_method } = req.body;

      await User.updateProfile(id, { username, avatar_url, billing_address, payment_method });
      const updatedUser = await User.findById(id);

      res.json({
        message: "Profile updated successfully",
        user: updatedUser
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

module.exports = authController;
