import express from 'express';
import { login, handleFindAccount, createNewAccount, verifyEmail, resetPassword, validateToken } from '../controllers/accountController.js';

const router = express.Router();

router.post('/login', login);
router.post('/find', handleFindAccount);
router.post('/create', createNewAccount);
router.post('/verify-email', verifyEmail);
router.post('/reset-password', resetPassword);
router.post('/validate-token', validateToken);

export default router;