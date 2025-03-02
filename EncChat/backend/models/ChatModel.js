import prisma from "../../backend/prismaClient.js";
import { encryptMessage, decryptMessage } from "../utils/encryption.js";

export async function getChatsList(accountId) {
    const chats = await prisma.accountToChat.findMany({
        where: {
            accountId: accountId,
        },
        select: {
            chatId: true,
        },
    });
    return chats.map(chat => chat.chatId) || null;
}

export async function getChatData(chatId) {
    const chatData = await prisma.chat.findMany({
        where: {
            id: chatId,
        },
    });
    return chatData;
}

export async function getChatMessages(chatId) {
    const messages = await prisma.message.findMany({
        where: {
            chatId,
        },
    });

    return messages.map(message => ({
        ...message,
        content: decryptMessage(message.content),
    }));
}

export async function getChatAccounts(chatId) {
    const accounts = await prisma.accountToChat.findMany({
        where: {
            chatId,
        },
    })
    return accounts.map(account => account.accountId);
}

export async function createMessage(data) {
    const message = await prisma.message.create({
        data: {
            chatId: data.chatId,
            authorId: data.authorId,
            content: encryptMessage(data.content),
            createdAt: new Date(data.createdAt),
        },
    });
    
    return {
        ...message,
        content: decryptMessage(message.content),
    };
}

export async function createChat(chatData) {
    const chat = await prisma.chat.create({
        data: chatData,
    });
    return chat;
}

export async function getAggregatedChatData(accountId) {
    const chats = await getChatsList(accountId);
    const chatData = await Promise.all(chats.map(chatId => getChatData(chatId)));
    const messages = await Promise.all(chats.map(chatId => getChatMessages(chatId)));
    const accounts = await Promise.all(chats.map(chatId => getChatAccounts(chatId)));
    
    const aggregatedChatData = [];
    chats.forEach((chatId, index) => {
        aggregatedChatData.push({
            chatId: chatId,
            ...chatData[index],
            messages: messages[index],
            accounts: accounts[index],
        });
    });

    Object.keys(aggregatedChatData).forEach(chatId => {
        if (aggregatedChatData[chatId]['0']) {
            aggregatedChatData[chatId] = {
                ...aggregatedChatData[chatId]['0'],
                messages: aggregatedChatData[chatId].messages,
                accounts: aggregatedChatData[chatId].accounts,
            };
        }
    });

    return aggregatedChatData;
}

export default [
    getChatsList,
    getChatData,
    getChatMessages,
    getChatAccounts,
    getAggregatedChatData,
    createMessage,
    createChat,
];