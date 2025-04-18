import express from 'express';
import { blockUser, unblockUser, listBlockedUsers } from '../controllers/friendController.js';

const router = express.Router();

router.post('/block', blockUser);
router.post('./unblock', unblockUser);
router.post('./list', listBlockedUsers);

export default router;