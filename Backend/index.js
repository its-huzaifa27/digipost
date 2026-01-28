import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./src/config/db.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Import Models to ensure they are synced
import "./src/models/user.model.js";
import "./src/models/platformConnection.model.js";
import "./src/models/client.model.js";
import "./src/models/post.model.js";
import "./src/models/postSchedule.model.js";

import authRoutes from "./src/routes/auth.routes.js";
import postRoutes from "./src/routes/post.routes.js";
import clientRoutes from "./src/routes/client.routes.js";
import dashboardRoutes from "./src/routes/dashboard.routes.js";
import authApiRoutes from "./src/routes/auth.api.routes.js";
import metaRoutes from "./src/routes/meta.routes.js";
import aiRoutes from "./src/routes/ai.routes.js";
import auditRoutes from "./src/routes/audit.routes.js";
import cronService from "./src/services/cron.service.js";

import "./src/models/auditLog.model.js"; // Ensure model is loaded for sync

dotenv.config();

// Connect to Database
import cookieParser from "cookie-parser";

// Connect to Database
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Cron
cronService.start();

// --- SECURITY MIDDLEWARE START ---

// 1. Block access to hidden files (dotfiles)
app.use((req, res, next) => {
  if (path.basename(req.path).startsWith(".") && req.path !== "/") {
    return res.status(403).send("Forbidden");
  }
  next();
});

// 2. Helmet for Security Headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://apis.google.com",
        ], // Adjust based on your needs
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: [
          "'self'",
          "data:",
          "https://*.fbcdn.net",
          "https://*.cdninstagram.com",
          "https://lh3.googleusercontent.com",
        ], // Allow images from social platforms
        connectSrc: [
          "'self'",
          "https://apis.google.com",
          "https://graph.facebook.com",
          "https://graph.instagram.com",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    strictTransportSecurity: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    frameguard: {
      action: "deny",
    },
    referrerPolicy: {
      policy: "strict-origin-when-cross-origin",
    },
    xContentTypeOptions: true, // nosniff
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allows resources to be loaded by approved origins
  }),
);

// 3. Permissions Policy (via custom header since Helmet doesn't have a default for this yet)
app.use((req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), camera=(), microphone=()",
  );
  next();
});

// 4. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// Apply rate limiting to all requests
app.use(limiter);

// --- SECURITY MIDDLEWARE END ---

// Security Middleware
const allowedOrigins = [
  "http://localhost:5173", // Local Development
  "http://localhost:5174", // Local Development (Backup Port)
  "https://app.datamatex.in", // Old Plan (keep just in case)
  "https://publixy.datamatex.in", // Production Frontend (NEW)
  "https://datamatex.in", // Marketing Site
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // Allow cookies
  }),
);

app.use(express.json());
app.use(cookieParser());

// Serve Static Uploads (Images/Videos)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes); // Social Auth
app.use("/auth", authApiRoutes); // User Auth (Login/Signup)
app.use("/api/posts", postRoutes);
app.use("/api/clients", clientRoutes); // Client Management
app.use("/api/dashboard", dashboardRoutes); // Dashboard Stats

app.use("/api/meta", metaRoutes); // Facebook/Instagram OAuth & Data
app.use("/api/ai", aiRoutes); // AI Content Generation
app.use("/api/audit", auditRoutes); // Audit Logs

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
