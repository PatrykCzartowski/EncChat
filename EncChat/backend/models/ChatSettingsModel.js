import prisma from "../../backend/prismaClient.js";

export async function getChatSettings(userId) {
    const chatSettings = await prisma.chatSettings.findFirst({
        where: {
            accountId: userId,
        },
    });
    return chatSettings;
}

export async function updateChatSettings(chatSettingsData) {
    const { id, ...data } = chatSettingsData;
    const chatSettings = await prisma.chatSettings.update({
        where: { id },
        data,
    });
    return chatSettings;
}

export default [
    getChatSettings,
    updateChatSettings,
]