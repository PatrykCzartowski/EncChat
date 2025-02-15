import express from 'express';
import { listFriends, addFriend } from '../controllers/friendController.js';

const router = express.Router();

router.post('/list', listFriends);
router.post('/add', addFriend);

export default router;