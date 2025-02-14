import express from 'express';
import { fetchProfile, editProfile, findProfiles } from '../controllers/profileController.js';
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/get', fetchProfile);
router.post('/edit', editProfile);
router.post('/find', findProfiles);

export default router;