import { getBlockedUsers, createBlockedUser, deleteBlockedUser } from '../models/BlockedUserModel.js';
 import { getProfile } from '../models/ProfileModel.js';
 import { removeFriend } from '../models/FriendModel.js';
 import logger from '../utils/logger.js';
 
 export const blockUser = async (req, res) => {
     try {
         const { userId, blockedId } = req.body;
         await removeFriend(userId, blockedId);
         const blockedUser = await createBlockedUser(userId, blockedId);
         logger.info(`User ${userId} blocked user ${blockedId}`);
         
         res.status(201).json(blockedId);
     } catch (error) {
         logger.error('Error blocking user: ', error);
         res.status(500).json({ error: 'Internal server error'});
     }
 };
 
 export const unblockUser = async (req, res) => {
     try {
         const { userId, blockedId } = req.body;
         const result = await deleteBlockedUser(userId, blockedId);
 
         logger.info(`User ${userId} unblocked user ${blockedId}`);
         res.status(200).json(result);
     } catch (error) {
         logger.error("Error unblocking user: ". error);
         res.status(500).json({ error: `Internal server error` });
     }
 };
 
 export const listBlockedUsers = async (req, res) => {
     try {
         const { userId } = req.body;
         const blockedUsers = await getBlockedUsers(userId);
         const blockedProfiles = await Promise.all(
             blockedUsers.map(user => getProfile(user.blockedAccountId))
         );
 
         logger.info(`Retrieved ${blockedProfiles.length} blocked users for user ${userId}`);
     } catch (error) {
         logger.error('Error fetching blocked users:', error);
         res.status(500).json({ error: 'Internal server error' });
     }
 };
 
 export default [
     blockUser,
     unblockUser,
     listBlockedUsers
 ]