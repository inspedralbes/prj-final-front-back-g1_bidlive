const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_fixed";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.username = decoded.username;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message, "Token:", token ? token.substring(0, 10) + "..." : "null");
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
