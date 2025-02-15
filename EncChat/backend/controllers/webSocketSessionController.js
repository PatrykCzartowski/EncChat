import {createWebSocketSession, getSessionIdByAccountId, deleteWebSocketSession} from '../models/WebSocketSessionModel.js';
import logger from '../utils/logger.js';

export const createSession = async (req, res) => {
    try {
        const session = await createWebSocketSession(req.body.accountId, req.body.sessionId);
        logger.info(`Created session ${session.sessionId} for account ${session.accountId}`);
        res.status(201).json(session);
    } catch (error) {
        logger.error('Error creating session:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getSessionId = async (req, res) => {
    try {
        const sessionId = await getSessionIdByAccountId(req.body.accountId);
        logger.info(`Fetched session id for account ${req.body.accountId}`);
        res.status(200).json(sessionId);
    } catch (error) {
        logger.error('Error fetching session id:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const deleteSession = async (req, res) => {
    try {
        const session = await deleteWebSocketSession(req.body.accountId);
        logger.info(`Deleted session ${session.sessionId}`);
        res.status(200).json(session);
    } catch (error) {
        logger.error('Error deleting session:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export default [
    createSession,
    getSessionId,
    deleteSession,
];