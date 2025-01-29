import { getChatsList, getChatData, createMessage } from '../models/ChatModel.js';

export const listChats = async (req, res) => {
  try {
    const chats = await getChatsList(req.body.accountId);
    res.status(200).json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const fetchChatData = async (req, res) => {
  try {
    const chatData = await getChatData(req.body.chatId);
    res.status(200).json(chatData);
  } catch (error) {
    console.error('Error fetching chat data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const message = await createMessage(req.body);
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};