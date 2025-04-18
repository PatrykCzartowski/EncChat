import express from 'express';
import { listFriends, addFriend, removeFriend } from '../controllers/friendController.js';

const router = express.Router();

router.post('/list', listFriends);
router.post('/add', addFriend);
router.post('/remove', removeFriend);

export default router;