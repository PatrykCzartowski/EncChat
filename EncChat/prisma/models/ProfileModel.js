import prisma from "../prismaClient.js";

export async function getProfile(userId) {
    const profile = await prisma.profile.findFirst({
        where: {
            accountId: userId,
        },
    });
    return profile;
}

export async function updateProfile(accountId, profileData) {
    const profile = await prisma.profile.update({
        where: { accountId },
        data: {
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            bio: profileData.bio,
            avatar: profileData.avatar,
        }
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