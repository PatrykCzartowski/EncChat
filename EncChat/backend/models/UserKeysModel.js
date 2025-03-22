import prisma from "../../backend/prismaClient.js";

export async function getUserById(userId) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
            updatedAt: true,
            profilePicture: true,
            publicKey: true,
          },
    });

    return user;
}

export async function updateUserPublicKey(userId, publicKey) {
    return await prisma.account.update({
        where: {
            id: userId,
        },
        data: {
            publicKey,
        },
    });
}

export async function getUserPublicKey(userId) {
    const user = await prisma.account.findUnique({
        where: {
            id: userId,
        },
        select: {
            publicKey: true,
        },
    });

    return user?.publicKey || null;
}