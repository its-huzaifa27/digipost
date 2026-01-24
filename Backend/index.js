import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './src/config/db.js';

// Import Models to ensure they are synced
import './src/models/user.model.js';
import './src/models/platformConnection.model.js';
import './src/models/client.model.js';
import './src/models/post.model.js';
import './src/models/postSchedule.model.js';

import authRoutes from './src/routes/auth.routes.js';
import postRoutes from './src/routes/post.routes.js';
import clientRoutes from './src/routes/client.routes.js';
import dashboardRoutes from './src/routes/dashboard.routes.js';
import authApiRoutes from './src/routes/auth.api.routes.js';
import metaRoutes from './src/routes/meta.routes.js';
import aiRoutes from './src/routes/ai.routes.js';
import cronService from './src/services/cron.service.js';

dotenv.config();

// Connect to Database
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Cron
cronService.start();

app.use(cors());
app.use(express.json());

// Serve Static Uploads (Images/Videos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes); // Social Auth
app.use('/auth', authApiRoutes);  // User Auth (Login/Signup)
app.use('/api/posts', postRoutes);
app.use('/api/clients', clientRoutes); // Client Management
app.use('/api/dashboard', dashboardRoutes); // Dashboard Stats
app.use('/api/meta', metaRoutes); // Facebook/Instagram OAuth & Data
app.use('/api/ai', aiRoutes); // AI Content Generation

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
