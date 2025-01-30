import prisma from "../../backend/prismaClient.js";

export async function findAccount(accountData) {     
    const { username, password, usernameIsEmail } = accountData;
    const account = await prisma.account.findFirst({
        where: {
            ...(usernameIsEmail ? { email: username } : { username: username }),
        },
    })
    return account.id;
}

export async function createAccount(accountData) {
    const account = await prisma.account.create({
        data: accountData,
    });
    return account;
}

export async function updateAccount(accountData) {
    const { id, ...data } = accountData;
    const account = await prisma.account.update({
        where: { id },
        data,
    });
    return account;
}

export async function updateAccountPassword(accountId, newPassword) {
    const account = await prisma.account.update({
        where: { id: accountId },
        data: { password: newPassword },
    });
    return account;
}

export async function deleteAccount(accountData) {
    const { id } = accountData;
    const account = await prisma.account.delete({
        where: { id },
    });
    return account;
}

export async function getAccounts() {
    const accounts = await prisma.account.findMany();
    return accounts;
}

export async function verifyEmailAddress(accountData) {
    const foundAccount = await prisma.account.findFirst({
        where: {
            email: accountData.email,
        },
    })
    if (foundAccount) {
        const account = await prisma.account.update({
            where: { id: foundAccount.id },
            data: { emailVerified: true },
        });
        if (account) {
            return account;
        }
    } else {
        throw new Error("Account not found.");
    }
}

export default [
    findAccount,
    createAccount,
    updateAccount,
    deleteAccount,
    getAccounts,
    verifyEmailAddress,
    updateAccountPassword,
];