import express from 'express';
import { listFriendRequests, sendFriendRequest, handleAcceptFriendRequest, handleDeclineFriendRequest } from '../controllers/friendRequestController.js';

const router = express.Router();

router.post('/get', listFriendRequests);
router.post('/send', sendFriendRequest);
router.post('/accept', handleAcceptFriendRequest);
router.post('/decline', handleDeclineFriendRequest);

export default router;