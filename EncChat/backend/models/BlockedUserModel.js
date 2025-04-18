import prisma from '../../backend/prismaClient.js';

export async function getBlockedUsers(accountId) {
    const blockedUsers = await prisma.blockedUser.findMany({
        where: {
            accountId: accountId,
        },
    });
    return blockedUsers;
}

export async function createBlockedUser(accountId, blockedAccountId) {
    const blockedUser = await prisma.blockedUser.create({
        data: {
            accountId: accountId,
            blockedAccountId: blockedAccountId,
        }
    });
    return blockedUser;
}

export async function deleteBlockedUser(accountId, blockedAccountId) {
    const blockedUser = await prisma.blockedUser.deleteMany({
        where: {
            accountId: accountId,
            blockedAccountId: blockedAccountId,
        },
    });
    return blockedUser;
}

export default [
    getBlockedUsers,
    createBlockedUser,
    deleteBlockedUser,
]