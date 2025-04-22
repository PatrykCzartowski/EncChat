import prisma from '../../backend/prismaClient.js';
 
 export async function getBlockedUsers(accountId) {
     const blockedUsers = await prisma.blockedUser.findMany({
         where: {
             accountId: parseInt(accountId),
         },
         include: {
            blockedAccount: {
                select: {
                    id: true,
                    username: true,
                    profile: true
                }
            }
        }
     });
     return blockedUsers;
 }
 
 export async function createBlockedUser(accountId, blockedAccountId) {
     const blockedUser = await prisma.blockedUser.create({
         data: {
             accountId: parseInt(accountId),
             blockedAccountId: parseInt(blockedAccountId),
         }
     });
     return blockedUser;
 }
 
 export async function deleteBlockedUser(accountId, blockedAccountId) {
     const blockedUser = await prisma.blockedUser.deleteMany({
         where: {
             accountId: parseInt(accountId),
             blockedAccountId: parseInt(blockedAccountId),
         },
     });
     return blockedUser;
 }
 
 export default [
     getBlockedUsers,
     createBlockedUser,
     deleteBlockedUser,
 ]