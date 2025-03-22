import { getChatsList, getChatData, createMessage, getAggregatedChatData } from '../models/ChatModel.js';
import { getChatSettings, updateChatSettings } from '../models/ChatSettingsModel.js'; // for the chat settings
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

// Chat settings
export const findChatSettings = async (req, res) => {
  try {
    const chatSettings = await getChatSettings(req.body.userId);
    logger.info(`Fetched chat settings for user ${req.body.userId}`);
    res.status(200).json(chatSettings);
  } catch (error) {
    logger.error('Error fetching chat settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const saveChatSettings = async (req, res) => {
  try {
    const chatSettings = await updateChatSettings(req.body);
    logger.info(`Updated chat settings for user ${req.body.userId}`);
    res.status(200).json(chatSettings);
  } catch (error) {
    logger.error('Error updating chat settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default [
  listChats,
  fetchChatData,
  sendMessage,
  findChatSettings,
  saveChatSettings,
];