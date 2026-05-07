const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  console.log("DEBUG authMiddleware JWT_SECRET IS:", JWT_SECRET);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    req.userId = decoded.userId;
    req.username = decoded.username;
    next();
  } catch (error) {
    try {
      // Fallback for old tokens generated before the secret was standardized
      const fallbackSecret = "your_jwt_secret_key_fixed";
      const decodedFallback = jwt.verify(token, fallbackSecret);
      req.user = decodedFallback;
      req.userId = decodedFallback.userId;
      req.username = decodedFallback.username;
      next();
    } catch (fallbackError) {
      console.error("JWT Verification Error:", fallbackError.message, "Token:", token ? token.substring(0, 10) + "..." : "null");
      return res.status(401).json({ message: "Invalid token" });
    }
  }
};

module.exports = authMiddleware;
