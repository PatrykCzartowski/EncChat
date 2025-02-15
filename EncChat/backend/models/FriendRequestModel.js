import prisma from "../../backend/prismaClient.js";

export async function createFriendRequest(senderId, receiverId) {
    const friendRequest = await prisma.friendRequest.create({
        data: {
            senderId: senderId,
            receiverId: receiverId,
        }
    });
    return friendRequest;
}

export async function getFriendRequests(accountId) {
    const friendRequests = await prisma.friendRequest.findMany({
        where: {
            receiverId: accountId,
            status: "SEND"
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