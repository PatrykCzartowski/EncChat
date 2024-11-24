import prisma from "@prisma/client";

export async function findAccount(accountData) {
    const { username, password, usernameIsEmail } = accountData;
    const account = await prisma.account.findUnique({
        where: {
            ...(usernameIsEmail ? { email: username } : { username: username }),
            password: password,
        },
    })
    if (account) {
        return true;
    } else {
        return false;
    }
}

export default [findAccount];