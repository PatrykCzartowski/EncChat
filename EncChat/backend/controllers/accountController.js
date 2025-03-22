import { findAccount, createAccount, verifyEmailAddress, updateAccountPassword } from '../models/AccountModel.js';
import { tokenForUser } from '../utils/tokenUtils.js';
import logger from '../utils/logger.js';
import jwt from "jsonwebtoken";
import prisma from "../models/prismaClient.js";

export const login = async (req, res) => {
  try {
    const account = await findAccount(req.body);
    const accountId = account.id;
    if (accountId) {
      logger.info(`User ${accountId} logged in`);
      return res.json({accountId, token: tokenForUser(accountId)});
    }
    logger.warn(`Account not found for ${req.body}`);
    res.status(404).json({ message: 'Account not found' });
  } catch (error) {
    logger.error(`Error logging in: ${error}`);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const handleFindAccount = async (req, res) => {
  try {
    const account = await findAccount(req.body.accountData);
    if (account) {
      logger.info(`Account found: ${account.id}`);
      return res.json(account);
    }
    logger.warn(`Account not found for ${req.body}`);
    res.status(404).json({ message: 'Account not found' });
  }
  catch (error) {
    logger.error(`Error finding account: ${error}`);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const createNewAccount = async (req, res) => {
  try {
    const account = await createAccount(req.body);
    logger.info(`New account created: ${account.id}`);
    res.status(201).json(account);
  } catch (error) {
    logger.error(`Error creating new account: ${error}`);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const verified = await verifyEmailAddress(req.body.email);
    if (!verified) {
      logger.warn(`Email not found: ${req.body.email}`);
      return res.status(404).json({ error: 'Email not found' });
    }
    logger.info(`Email verified: ${req.body.email}`);
    res.status(200).json(verified);
  } catch (error) {
    logger.error(`Error verifying email: ${error}`);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { accountId, newPassword } = req.body;
    const updated = await updateAccountPassword(accountId, newPassword);
    if (!updated) {
      logger.warn(`Account not found: ${accountId}`);
      return res.status(404).json({ error: 'Account not found' });
    }
    logger.info(`Password reset for account: ${accountId}`);
    res.status(200).json(updated);
  } catch (error) {
    logger.error(`Error resetting password: ${error}`);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const validateToken = async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ valid: false, reason: "No token provided" });
  }
  
  try {
    const session = await prisma.webSocketSession.findUnique({
      where: { sessionId: token },
    });
    
    if (!session) {
      logger.warn(`Token ${token} not found in DB`);
      return res.status(404).json({ valid: false, reason: "Token not found in DB" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    return res.status(200).json({ valid: true, userId: decoded.sub });
  } catch (error) {
    logger.error(`Token validation error: ${error}`);
    return res.status(401).json({ valid: false, reason: "Token expired or invalid" });
  }
};

export default [
  login,
  handleFindAccount,
  createNewAccount,
  verifyEmail,
  resetPassword,
];