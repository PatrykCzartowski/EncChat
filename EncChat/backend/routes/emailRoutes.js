import express from 'express';
import { sendVerificationEmail, sendPasswordResetEmail } from '../controllers/emailController.js';

const router = express.Router();

router.post('/send-verification-email', sendVerificationEmail);
router.post('/send-password-reset-email', sendPasswordResetEmail);

export default router;