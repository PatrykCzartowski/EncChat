import { findAccount, createAccount, verifyEmailAddress, updateAccountPassword } from '../models/AccountModel.js';

export const login = async (req, res) => {
  try {
    const account = await findAccount(req.body);
    if (account) return res.json(account);
    res.status(404).json({ message: 'Account not found' });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createNewAccount = async (req, res) => {
  try {
    const account = await createAccount(req.body);
    res.status(201).json(account);
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const verified = await verifyEmailAddress(req.body.email);
    res.status(200).json(verified);
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { accountId, newPassword } = req.body;
    const updated = await updateAccountPassword(accountId, newPassword);
    res.status(200).json(updated);
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};