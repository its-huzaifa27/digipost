import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  // Check for token in Cookies (primary) or Header (backup for tools like Postman)
  const token =
    req.cookies.token ||
    (req.headers["authorization"] &&
      req.headers["authorization"].split(" ")[1]);

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "your_super_secret_key",
    (err, user) => {
      if (err) {
        console.error("Token verification failed:", err.message);
        return res.status(403).json({ error: "Invalid or expired token" });
      }

      // Attach user info to request
      req.user = user;
      next();
    },
  );
};
