import express from 'express';
import { listFriends, addFriend, deleteFriend } from '../controllers/friendController.js';

const router = express.Router();

router.post('/list', listFriends);
router.post('/add', addFriend);
router.post('/remove', deleteFriend);

export default router;