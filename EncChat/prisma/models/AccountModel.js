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

export async function verifyEmailAddress(accountData) {
    console.log("--- Verifying email address ---");
    console.log("Received accountData: ", accountData);

    const foundAccount = await prisma.account.findFirst({
        where: {
            email: accountData.email,
        },
    })
    if (foundAccount) {
        console.log("Found account: ", foundAccount);
        const account = await prisma.account.update({
            where: { id: foundAccount.id },
            data: { emailVerified: true },
        });
        if (account) {
            console.log("Email verified: ", account);
            return account;
        }
    } else {
        throw new Error("Account not found");
    }
}

export default [
    findAccount,
    createAccount,
    updateAccount,
    deleteAccount,
    getAccounts,
    verifyEmailAddress,
];