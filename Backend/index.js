import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';
import authRoutes from './src/routes/auth.routes.js';
import postRoutes from './src/routes/post.routes.js';
import clientRoutes from './src/routes/client.routes.js';
import dashboardRoutes from './src/routes/dashboard.routes.js';
import authApiRoutes from './src/routes/auth.api.routes.js';

dotenv.config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes); // Social Auth
app.use('/auth', authApiRoutes);  // User Auth (Login/Signup)
app.use('/api/posts', postRoutes);
app.use('/api/clients', clientRoutes); // Client Management
app.use('/api/dashboard', dashboardRoutes); // Dashboard Stats

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
