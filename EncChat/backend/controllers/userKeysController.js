import { getUserById, updateUserPublicKey, getUserPublicKey } from '../models/UserKeysModel.js';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js'

export const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await getUserById(userId);

        if(!user) return res.status(404).json({ error: "user not found"});

        return res.status(200).json(user);
    } catch (error) {
        logger.error(`Error getting user profile: ${error}`);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const storeUserPublicKey = async (req, res) => {
    try {
        const { userId, publicKey } = req.body;

        const authHeader = req.headers.authorization;

        if(!authHeader) return res.status(401).json({ error: "No authorization header" });

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(decoded.userId !== userId) return res.status(403).json({ error: "Not authorized to update this user's key" });

        await updateUserPublicKey(userId, publicKey);

        res.status(200).json({ success: true });
    } catch (error) {
        logger.error(`Error storing user public key: ${error}`);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getPublicKey = async (req, res) => {
    try {
        const { userId } = req.body;

        if(!userId) return res.status(400).json({ error: "User ID not provided" });

        const publicKey = await getUserPublicKey(userId);

        if(!publicKey) return res.status(404).json({ error: "Public key not found" });

        res.status(200).json({ publicKey });
    } catch (error) {
        logger.error(`Error getting user public key: ${error}`);
        res.status(500).json({ error: 'Internal server error' });
    }
};