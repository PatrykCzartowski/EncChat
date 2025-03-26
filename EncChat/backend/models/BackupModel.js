import prisma from "../prismaClient.js";

export async function findBackups(userId) {
    console.log('userId: ', userId);
    const backups = await prisma.backup.findMany({
        where: {
            accountId: userId,
        },
    });
    return backups;
}

export async function createBackup(backupData) {
    const backup = await prisma.backup.create({
        data: backupData,
    });
    return backup;
}

export async function deleteBackup(backupId) {
    const backup = await prisma.backup.delete({
        where: { id: backupId },
    });
    return backup;
}

export async function findBackupById(backupId) {
    const backup = await prisma.backup.findUnique({
        where: { id: backupId },
    });
    return backup;
}

export default [
    findBackups,
    createBackup,
    deleteBackup,
    findBackupById,
]