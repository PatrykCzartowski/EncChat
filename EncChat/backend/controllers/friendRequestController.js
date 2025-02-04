import {getFriendRequests, createFriendRequest, acceptFriendRequest, declineFriendRequest} from '../models/FriendRequestModel.js';
import logger from '../utils/logger.js';

export const sendFriendRequest = async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;
        const friendRequest = await createFriendRequest(senderId, receiverId);
        if(friendRequest) { 
            logger.info(`Friend request sent from ${senderId} to ${receiverId}`);
            return res.status(201).json(friendRequest);
        }
        logger.warn(`Friend request not sent from ${senderId} to ${receiverId}`);
        res.status(400).json({ message: 'Friend request not sent' });
    } catch (error) {
        logger.error(`Error sending friend request: ${error}`);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const listFriendRequests = async (req, res) => {
    try {
        const userId = req.body.userId;
        const friendRequests = await getFriendRequests(userId);
        if(friendRequests) {
            logger.info(`${friendRequests.length} friend requests retrieved for ${userId}`);
            return res.status(200).json(friendRequests);
        }
        logger.warn(`No friend requests found for ${userId}`);
        res.status(404).json({ message: 'No friend requests found' });
    } catch (error) {
        logger.error(`Error retrieving friend requests: ${error}`);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const handleFriendRequest = async (req, res, action, actionName) => {
    try {
        const requestId = req.body.requestId;
        const result = await action(requestId);

        if(result) {
            logger.info(`Friend request ${requestId} ${actionName}`);
            return res.status(200).json(result);
        }

        logger.warn(`Friend request ${requestId} not ${actionName}`);
        res.status(400).json({ message: `Friend request not ${actionName}` });
    } catch (error) {
        logger.error(`Error ${actionName} friend request: ${error}`);
        res.status(500).json({ error: 'Internal server error' });
    }
} 

export const handleAcceptFriendRequest = async (req, res) => {
    handleFriendRequest(req, res, acceptFriendRequest, 'accepted');
}

export const handleDeclineFriendRequest = async (req, res) => {
    handleFriendRequest(req, res, declineFriendRequest, 'declined');
}

export default [
    sendFriendRequest,
    listFriendRequests,
    handleAcceptFriendRequest,
    handleDeclineFriendRequest,
]