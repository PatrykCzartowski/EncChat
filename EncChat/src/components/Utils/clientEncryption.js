class ChatEncryption {
    constructor() {
        this.keyPair = null;
        this.chatKeys = {};
    }

    async generateKeyPair() {
        const keyPair = await window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256",
            },
            true,
            ["encrypt", "decrypt"]
        );

        this.keyPair = keyPair;

        return await this.exportPublicKey();
    }

    async exportPublicKey() {
        const exportedKey = await window.crypto.subtle.exportKey(
            "spki",
            this.keyPair.publicKey
        );
        return btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
    }

    async generateChatKey(chatId) {
        const key = await window.crypto.subtle.generateKey(
            {
                name: "AES-GCM",
                length: 256,
            },
            true,
            ["encrypt", "decrypt"]
        );

        this.chatKeys[chatId] = key;
        return key;
    }

    async exportChatKey(chatId) {
        if(!this.chatKeys[chatId]) {
            throw new Error(`No encryption key exists for this chat: ${chatId}`);
        }

        const exportedKey = await window.crypto.subtle.exportKey(
            "raw",
            this.chatKeys[chatId]
        );

        return new Uint8Array(exportedKey);
    }

    async importChatKey(chatId, keyData) {
        const key = await window.crypto.subtle.importKey(
            "raw",
            keyData,
            {
                name: "AES-GCM",
                length: 256,
            },
            false,
            ["encrypt", "decrypt"]
        );

        this.chatKeys[chatId] = key;
    }

    //Encrypt a message for a specific chat
    async encryptMessage(chatId, message) {
        if(!this.chatKeys[chatId]) {
            throw new Error(`No encryption key for this chat: ${chatId}`);
        }

        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encodedMessage = new TextEncoder().encode(message);

        const encodedData = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv,
            },
            this.chatKeys[chatId],
            encodedMessage
        );

        const result = {
            iv: Array.from(iv),
            data: Array.from(new Uint8Array(encodedData)),
        };

        return JSON.stringify(result);
    }

    //Decrypt a message for a specific chat
    async decryptMessage(chatId, encryptedMessage) {
        if(!this.chatKeys[chatId]) {
            throw new Error(`No encryption key for this chat: ${chatId}`);
        }

        const { iv, data } = JSON.parse(encryptedMessage);

        const decryptedData = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: new Uint8Array(iv),
            },
            this.chatKeys[chatId],
            new Uint8Array(data)
        );

        return new TextDecoder().decode(decryptedData);
    }

    // Encrypt a chat key with another user's public key
    async encryptChatKey(chatId, recipientPublicKey) {
        if(!this.chatKeys[chatId]) {
            throw new Error(`No encryption key exists for this chat: ${chatId}`);
        }

        const exportedKey = await this.exportChatKey(chatId);

        const publicKey = await window.crypto.subtle.importKey(
            "spki",
            Uint8Array.from(atob(recipientPublicKey), c => c.charCodeAt(0)),
            {
                name: "RSA-OAEP",
                hash: "SHA-256",
            },
            false,
            ["encrypt"]
        );

        const encryptedKey = await window.crypto.subtle.encrypt(
            {
                name: "RSA-OAEP",
            },
            this.keyPair.privateKey,
            Uint8Array.from(atob(encryptedKey), c => c.charCodeAt(0))
        );

        await this.importChatKey(chatId, keyData);
    }
}