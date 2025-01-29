import express from 'express';
import { listChats, fetchChatData, sendMessage } from '../controllers/chatController.js';

const router = express.Router();

router.post('/list', listChats);
router.post('/data', fetchChatData);
router.post('/send', sendMessage);

export default router;
