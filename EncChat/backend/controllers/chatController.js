import { getChatsList, getChatData, createMessage, getAggregatedChatData } from '../models/ChatModel.js';
import logger from '../utils/logger.js';

export const listChats = async (req, res) => {
  try {
    const chats = await getAggregatedChatData(req.body.userId);
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

export const sendMessage = async (messageData) => {

  if (!messageData.chatId || !messageData.content || !messageData.authorId) {
    logger.error('Missing required message data');
    throw new Error('Missing required message data');
  }

  try {
    const message = await createMessage(messageData);
    logger.info(`Sent message to chat ${messageData.chatId}`);
    return {data: message };
  } catch (error) {
    logger.error('Error sending message:', error);
  }
};

export default [
  listChats,
  fetchChatData,
  sendMessage,
];