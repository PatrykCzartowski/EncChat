import express from 'express';
import { fetchProfile, editProfile } from '../controllers/profileController.js';
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/get', authenticateToken, fetchProfile);
router.put('/edit', authenticateToken, editProfile);

export default router;