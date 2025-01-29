import { getFriends, createFriend } from '../models/FriendModel.js';

export const listFriends = async (req, res) => {
  try {
    const friends = await getFriends(req.body.accountId);
    res.status(200).json(friends);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addFriend = async (req, res) => {
  try {
    const friend = await createFriend(req.body.accountId, req.body.friendId);
    res.status(201).json(friend);
  } catch (error) {
    console.error('Error adding friend:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};