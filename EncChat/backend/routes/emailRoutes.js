import express from 'express';
import { getEmailServiceData } from '../controllers/emailController.js';

const router = express.Router();

router.post('/get', getEmailServiceData);

export default router;