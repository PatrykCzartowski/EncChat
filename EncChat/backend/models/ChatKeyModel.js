import prisma from "../prismaClient.js";
import crypto from 'crypto';

export async function generateChatKey(chatId) {
    const key = crypto.randomBytes(32).toString('hex');

    const chatKey = await prisma.chatKey.create({
        data: {
            chatId: chatId,
            key: key,
            createdAt: new Date()
        }
    });
    
    return chatKey.key;
}

export async function getChatKey(chatId) {
    const chatKey = await prisma.chatKey.findFirst({
        where: {
            chatId: chatId
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    
    return chatKey ? chatKey.key : null;
}

export default {
    generateChatKey,
    getChatKey
};