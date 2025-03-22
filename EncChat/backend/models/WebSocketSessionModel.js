import prisma from "../../backend/prismaClient.js";

export async function createWebSocketSession(accountId, sessionId) {
    const session = await prisma.webSocketSession.create({
        data: {
            sessionId,
            accountId,
        },
    });
    return session;
}

export async function getSessionIdByAccountId(accountId) {
    const sessions = await prisma.webSocketSession.findMany({
        where: {
            accountId,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    if(sessions) {
        const sessionsTokens = []
            sessions.forEach(session => {
                sessionsTokens.push(session.sessionId)
        })
        return sessionsTokens
    }

    return null
}

export async function deleteWebSocketSession(wssId) {
    const session = await prisma.webSocketSession.findUnique({
        where: { sessionId: wssId },
    });

    if (!session) {
        console.log(`Session with ID ${wssId} not found.`);
        return;
    }
    
    await prisma.webSocketSession.delete({
        where: {
            sessionId: wssId,
        },
    });

    return session;
}

export default [
    createWebSocketSession,
    getSessionIdByAccountId,
    deleteWebSocketSession,
]