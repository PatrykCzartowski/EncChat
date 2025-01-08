import prisma from "../prismaClient.js";

export async function createFriendRequest(friendRequestData) {
    const friendRequest = await prisma.friendRequest.create({
        data: friendRequestData,
    });
    return friendRequest;
}

export async function getFriendRequests(accountId) {
    const friendRequests = await prisma.friendRequest.findMany({
        where: {
            receiverId: accountId,
        },
    });
    return friendRequests;
}

export async function acceptFriendRequest(requestId) {
    const friendRequest = await prisma.friendRequest.update({
        where: { id: requestId },
        data: {
            status: "ACCEPTED",
            hidden: true,
        },
    });
    return friendRequest;
}

export async function declineFriendRequest(requestId) {
    const friendRequest = await prisma.friendRequest.update({
        where: { id: requestId },
        data: {
            status: "DECLINED",
            hidden: true,
        },
    });
    return friendRequest;
}

export default [
    createFriendRequest,
    getFriendRequests,
    acceptFriendRequest,
    declineFriendRequest,
    
]