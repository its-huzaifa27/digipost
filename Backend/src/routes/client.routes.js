import express from 'express';
import { createClient, getClients } from '../controllers/client.controller.js';
// We need an auth middleware to populate req.user
// Assuming we can reuse one or create a simple one if not existing suitable
// Let's reuse the one from previous sessions or assume a standard bearer token check.
// Checking file system for middleware.
import { authenticateToken } from '../middleware/auth.middleware.js'; 

const router = express.Router();

router.post('/', authenticateToken, createClient);
router.get('/', authenticateToken, getClients);

export default router;
