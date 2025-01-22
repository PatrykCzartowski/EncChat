import prisma from "../prismaClient.js";

export async function getFriends(userId) {
    const friends = await prisma.friend.findMany({
        where: {
            accountId: userId,
        },
    });
    return friends;
}

export async function getFriendProfile(friendId) {
    const friendProfile = await prisma.profile.findFirst({
        where: {
            accountId: friendId,
        },
    });
    return friendProfile;
}

export async function createFriend(accountId, newFriendId) {
    const friend = await prisma.friend.create({
        data: {
            accountId: accountId,
            friendId: newFriendId,
        },
    });
    const newFriend = await prisma.friend.create({
        data: {
            accountId: newFriendId,
            friendId: accountId,
        },
    });
    return friend;
}

export default [
    getFriends, 
    getFriendProfile,
    createFriend,
];


