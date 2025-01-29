import { getProfile, updateProfile } from '../models/ProfileModel.js';

export const fetchProfile = async (req, res) => {
  try {
    const profile = await getProfile(req.body.accountId);
    if (profile) return res.json(profile);
    res.status(404).json({ message: 'Profile not found' });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const editProfile = async (req, res) => {
  try {
    const updatedProfile = await updateProfile(req.body.accountId, req.body.profileData);
    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
