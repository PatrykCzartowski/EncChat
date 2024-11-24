import prisma from "../prismaClient.js";

export async function getChats(id) {
    const chats = await prisma.chat.findMany({
        where: {
            id
        },
    });
}

export async function getChatMessages(chatId) {
    const messages = await prisma.message.findMany({
        where: {
            chatId,
        },
    });
    return messages;
}

export async function createMessage(messageData) {
    const message = await prisma.message.create({
        data: messageData,
    });
    return message;
}

export async function createChat(chatData) {
    const chat = await prisma.chat.create({
        data: chatData,
    });
    return chat;
}

export default [
    getChats,
    getChatMessages,
    createMessage,
    createChat,
];