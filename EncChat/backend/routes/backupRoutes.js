import express from "express";
import { listBackups, saveBackup, removeBackup, getBackupById } from "../controllers/backupController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/list', listBackups);
router.post('/save', saveBackup);
router.delete('/remove/:backupId', removeBackup);
router.get('/get/:id', getBackupById);

export default router;