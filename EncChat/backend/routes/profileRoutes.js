import express from 'express';
import { fetchProfile, editProfile, findProfiles } from '../controllers/profileController.js';
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/get', authenticateToken, fetchProfile);
router.put('/edit', authenticateToken, editProfile);
router.post('/find', findProfiles);

export default router;