import express from 'express';
import { getUserProfile, storeUserPublicKey, getPublicKey } from '../controllers/userKeysController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/profile", authenticateToken, getUserProfile);
router.post("/public-key", authenticateToken, getPublicKey);
router.post("/store-public-key", authenticateToken, storeUserPublicKey);

export default router;