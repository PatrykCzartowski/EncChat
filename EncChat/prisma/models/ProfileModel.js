import prisma from "../prismaClient.js";

export async function getProfile(userId) {
    const profile = await prisma.profile.findFirst({
        where: {
            accountId: userId,
        },
    });
    return profile;
}

export async function updateProfile(profileData) {
    const { id, ...data } = profileData;
    const profile = await prisma.profile.update({
        where: { id },
        data,
    });
    return profile;
}

export async function findProfileLike(providedString) {
    const profiles = await prisma.account.findMany({
        where: {
            OR: [
                { profile: { firstName: { contains: providedString } } },
                { profile: { lastName: { contains: providedString } } },
                { email: { contains: providedString } },
            ],
        },
        include: {
            profile: true,
        },
    });
    return profiles;
}

export default [
    getProfile,
    updateProfile,
    findProfileLike,
    
]