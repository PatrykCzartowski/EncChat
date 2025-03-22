import express from 'express';
import { listChats, fetchChatData, sendMessage, findChatSettings, saveChatSettings } from '../controllers/chatController.js';

const router = express.Router();

router.post('/list', listChats);
router.post('/data', fetchChatData);
router.post('/send', sendMessage);
router.post('/settings/get', findChatSettings);
router.post('/settings/save', saveChatSettings);

export default router;
