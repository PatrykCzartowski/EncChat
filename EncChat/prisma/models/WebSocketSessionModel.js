import prisma from "../prismaClient.js";

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

export async function deleteWebSocketSession(sessionId) {
    const session = await prisma.webSocketSession.delete({
        where: {
            sessionId,
        },
    });
    return session;
}

export default [
    createWebSocketSession,
    getSessionIdByAccountId,
    deleteWebSocketSession,
]