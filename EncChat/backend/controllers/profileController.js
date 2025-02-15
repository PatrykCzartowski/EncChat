import { getProfile, updateProfile, findProfileLike } from '../models/ProfileModel.js';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import logger from '../utils/logger.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

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
    const {accountId, profileData} = req.body;
    let avatarUrl = null;
    if(profileData.avatar) {
      const uploadResult = await cloudinary.uploader.upload(profileData.avatar, {
        folder: 'avatars',
      });
      avatarUrl = uploadResult.secure_url;
    }
    profileData.avatar = avatarUrl;
    const updatedProfile = await updateProfile(accountId, profileData);
    logger.info(`Updated profile for account ${accountId}`);
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