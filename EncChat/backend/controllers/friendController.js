import { getFriends, createFriend } from '../models/FriendModel.js';
import { getProfile } from '../models/ProfileModel.js';
import logger from '../utils/logger.js';

export const listFriends = async (req, res) => {
  try {
    const friends = await getFriends(req.body.userId);
    logger.info(`Fetched ${friends.length} friends for user ${req.body.userId}`);
    const friendsProfiles = await Promise.all(
      friends.map((friend) => getProfile(friend.friendId))
    );
    logger.info(`Fetched profiles for ${friendsProfiles.length} friends`);
    res.status(200).json(friendsProfiles);
  } catch (error) {
    logger.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addFriend = async (req, res) => {
  try {
    const friend = await createFriend(req.body.userId, req.body.friendId);
    logger.info(`Added friend ${req.body.friendId} for user ${req.body.userId}`);
    res.status(201).json(friend);
  } catch (error) {
    logger.error('Error adding friend:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default [
  listFriends,
  addFriend,
];