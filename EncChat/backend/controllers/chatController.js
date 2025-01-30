import { getChatsList, getChatData, createMessage } from '../models/ChatModel.js';
import logger from '../utils/logger.js';

export const listChats = async (req, res) => {
  try {
    const chats = await getChatsList(req.body.userId);
    logger.info(`Fetched ${chats.length} chats for user ${req.body.userId}`);
    res.status(200).json(chats);
  } catch (error) {
    logger.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const fetchChatData = async (req, res) => {
  try {
    const chatData = await getChatData(req.body.chatId);
    logger.info(`Fetched chat data for chat ${req.body.chatId}`);
    res.status(200).json(chatData);
  } catch (error) {
    logger.error('Error fetching chat data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const message = await createMessage(req.body);
    logger.info(`Sent message to chat ${req.body.chatId}`);
    res.status(201).json(message);
  } catch (error) {
    logger.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default [
  listChats,
  fetchChatData,
  sendMessage,
];