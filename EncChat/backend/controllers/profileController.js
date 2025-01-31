import { getProfile, updateProfile, findProfileLike } from '../models/ProfileModel.js';
import logger from '../utils/logger.js';

export const fetchProfile = async (req, res) => {
  try {
    const profile = await getProfile(req.body.accountId);
    if (profile) {
      logger.info(`Fetched profile for account ${req.body.accountId}`);
      return res.json(profile);
    }
    logger.error(`Profile not found for account ${req.body.accountId}`);
    res.status(404).json({ message: 'Profile not found' });
  } catch (error) {
    logger.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const editProfile = async (req, res) => {
  try {
    const updatedProfile = await updateProfile(req.body.accountId, req.body.profileData);
    logger.info(`Updated profile for account ${req.body.accountId}`);
    res.status(200).json(updatedProfile);
  } catch (error) {
    logger.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const findProfiles = async (req, res) => {
  try {
    const profiles = await findProfileLike(req.body.providedString);
    logger.info(`Found ${profiles.length} profiles like "${req.body.providedString}"`);
    res.status(200).json(profiles);
  } catch {
    logger.error('Error finding profiles');
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default [
  fetchProfile,
  editProfile,
  findProfiles,
];