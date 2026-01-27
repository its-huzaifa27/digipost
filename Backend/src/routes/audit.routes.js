import express from 'express';
import { getAuditLogs } from '../controllers/audit.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Only authenticated users can view logs
router.get('/', authenticateToken, getAuditLogs);

export default router;
