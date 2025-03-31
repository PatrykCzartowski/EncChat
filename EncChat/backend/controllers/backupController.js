import { findBackups, createBackup, deleteBackup, findBackupById } from "../models/BackupModel.js";
import logger from "../utils/logger.js";

export const listBackups = async (req, res) => {
    const userId = req.body.userId;
    logger.info(`Listing backups for user ${userId}`);
    try {
        const backups = await findBackups(userId);
        logger.info(`Backups found: ${backups}`);
        if(backups) {
            logger.info(`Found ${backups.length} backups for user ${userId}`);
            return res.json({backups});
        }
        logger.warn(`No backups found for user ${userId}`);
        res.status(404).json({message: 'No backups found'});
    } catch (error) {
        logger.error(`Error listing backups: ${error}`);
        res.status(500).json({error: 'Internal server error'});
    }
};

export const saveBackup = async (req, res) => {
    let { accountId, backupName, encryptedData, timestamp } = req.body;
    accountId = parseInt(accountId);
    encryptedData = JSON.stringify(encryptedData);
    const backupData = { accountId, backupName, encryptedData, timestamp };
    try {
        const backup = await createBackup(backupData);
        logger.info(`Backup created: ${backup.id} for user ${backup.accountId}`);
        res.status(201).json(backup);
    } catch (error) {
        logger.error(`Error creating backup: ${error}`);
        res.status(500).json({error: 'Internal server error'});
    }
}

export const removeBackup = async (req, res) => {
    const backupId = parseInt(req.params.backupId);
    try {
        const backup = await deleteBackup(backupId);
        if(backup) {
            logger.info(`Backup removed: ${backup.id}`);
            return res.json(backup);
        }
        logger.warn(`Backup not found: ${backupId}`);
        res.status(404).json({message: 'Backup not found'});
    } catch (error) {
        logger.error(`Error removing backup: ${error}`);
        res.status(500).json({error: 'Internal server error'});
    }
}

export const getBackupById = async (req, res) => {
    const backupId = parseInt(req.params.id);
    try {
        const backup = await findBackupById(backupId);
        if(backup) {
            logger.info(`Found backup: ${backup.id}`);
            return res.json(backup);
        }
        logger.warn(`Backup not found: ${backupId}`);
        res.status(404).json({message: 'Backup not found'});
    } catch (error) {
        logger.error(`Error retrieving backup: ${error}`);
        res.status(500).json({error: 'Internal server error'});
    }
}

export default [
    listBackups,
    saveBackup,
    removeBackup,
    getBackupById,
]