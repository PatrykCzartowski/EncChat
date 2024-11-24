import prisma from "../prismaClient.js";

export async function getFriends(userId) {
    const friends = await prisma.friend.findMany({
        where: {
            id: userId,
        },
    });
    return friends;
}

export async function getFriendProfile(friendId) {
    const friendProfile = await prisma.profile.findFirst({
        where: {
            id: friendId,
        },
    });
    return friendProfile;
}

export default [
    getFriends, 
    getFriendProfile
];


