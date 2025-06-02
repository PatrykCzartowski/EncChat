import { generateChatKey, getChatKey } from '../models/ChatKeyModel.js';
import logger from '../utils/logger.js';

export const getKey = async (req, res) => {
    try {
        const { chatId, userId } = req.body;
        const key = await getChatKey(chatId);
        
        if (!key) {
            const newKey = await generateChatKey(chatId);
            logger.info(`Generated new key for chat ${chatId}`);
            return res.status(200).json({ key: newKey });
        }
        
        logger.info(`Retrieved key for chat ${chatId}`);
        return res.status(200).json({ key });
    } catch (error) {
        logger.error(`Error retrieving chat key: ${error}`);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createKey = async (req, res) => {
    try {
        const { chatId } = req.body;
        
        const key = await generateChatKey(chatId);
        
        logger.info(`Created new key for chat ${chatId}`);
        res.status(201).json({ key });
    } catch (error) {
        logger.error(`Error creating chat key: ${error}`);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export default [
    getKey,
    createKey
];