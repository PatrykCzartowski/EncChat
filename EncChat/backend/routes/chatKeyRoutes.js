import express from 'express';
import { getKey, createKey } from '../controllers/chatKeyController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/get', authenticateToken, getKey);
router.post('/create', authenticateToken, createKey);

export default router;