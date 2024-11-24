import prisma from "../prismaClient.js";

export async function findAccount(accountData) {
    const { username, password, usernameIsEmail } = accountData;
    const account = await prisma.account.findFirst({
        where: {
            ...(usernameIsEmail ? { email: username } : { username: username }),
        },
    })
    return account;
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

export default [
    findAccount,
    createAccount,
    updateAccount,
    deleteAccount,
    getAccounts,
];