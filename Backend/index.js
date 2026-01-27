import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./src/config/db.js";

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

// ... imports remain the same

// Connect to Database
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Cron
cronService.start();

// Security Middleware
const allowedOrigins = [
  "http://localhost:5173", // Local Development
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
