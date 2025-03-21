class keyBackupManager {
    constructor(chatEncryption) {
        this.chatEncryption = chatEncryption;
        this.initialized = false;
    }

    async init() {
        if (!this.chatEncryption.initialized) {
            await this.chatEncryption.init();
        }
        this.initialized = true;
    }

    //generate backup file for all user's keys
    async createBackup() {
        if(!this.initialized) await this.init();

        try {
            const userId = sessionStorage.getItem('currentUserId');
            if(!userId) throw new Error('No user ID available for backup creation');

            const keyPairExport = await this.chatEncryption.exportKeyPair();
            const chatKeysExport = {};

            for(const chatId in this.chatEncryption.chatKeys) {
                const exportedKey = await this.chatEncryption.exportChatKey(chatId);
                chatKeysExport[chatId] = exportedKey;
            }

            const backupData = {
                userId,
                timestamp: new Date().toISOString(),
                keyPair: keyPairExport,
                chatKeys: chatKeysExport,
            }

            const password = prompt('Please enter a password to secure your backup: ');
            if(!password) throw new Error('Backup cancelled: No password provided');

            const encryptedBackup = await this._encryptBackup(backupData, password);

            //create and download backup file
            const blob = new Blob([JSON.stringify(encryptedBackup)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `encchat_chat_keys_backup_${userId}_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Error creating backup: ', error);
            return false;
        }
    }

    async restoreFromBackup(backupFile, password) {
        if(!this.initialized) await this.init();

        try {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = async (event) => {
                    try {
                        const encryptedBackup = JSON.parse(event.target.result);
                        const backupData = await this._decryptBackup(encryptedBackup, password);

                        if(!backupData.userId || !backupData.keyPair || !backupData.chatKeys) {
                            throw new Error('Invalid backup file format');
                        }

                        sessionStorage.setItem(currentUserId, backupData.userId);

                        await this.chatEncryption.importKeyPair(backupData.keyPair);
                        for(const chatId in backupData.chatKeys) {
                            await this.chatEncryption.importChatKey(chatId, backupData.chatKeys[chatId]);
                        }

                        const keyStorageId = `userKeyPair_${backupData.userId}`;
                        sessionStorage.setItem(keyStorageId, backupData.keyPair);

                        await this.chatEncryption.saveChatKeys();

                        resolve({
                            success: true,
                            userId: backupData.userId,
                            chatCount: Object.keys(backupData.chatKeys).length,
                        });
                    } catch (error) {
                        console.error('Error restoring backup: ', error);
                        reject(error);
                    }
                };

                reader.onerror = () => {
                    reject(new Error('Failed to read backup file'));
                };

                reader.readAsText(backupFile);
            });
        } catch (error) {
            console.error('Error restoring backup: ', error);
            throw error;
        }
    }

    async _encryptBackup(data, password) {
        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        const key = await this._deriveKey(password, salt);

        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encoder = new TextEncoder();

        const encryptedData = await window.crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv,
            },
            key,
            encodedData,
        );

        return {
            salt: Array.from(salt),
            iv: Array.from(iv),
            data: Array.from(new Uint8Array(encryptedData)),
            iterations: 100000,
        }
    }

    async _decryptBackup(encryptedBackup, password) {
        const salt = new Uint8Array(encryptedBackup.salt);
        const iv = new Uint8Array(encryptedBackup.iv);
        const data = new Uint8Array(encryptedBackup.data);
        const iterations = encryptedBackup.iterations || 100000;

        const key = await this._deriveKey(password, salt, iterations);

        try{
            const decryptedData = await window.crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv,
                },
                key,
                data
            );

            const decoder = new TextDecoder();
            const decodedData = decoder.decode(decryptedData);

            return JSON.parse(decodedData);
        } catch (error) {
            throw new Error('Wrong password or corrupted backup file');
        }
    }

    async _deriveKey(password, salt, iterations = 100000) {
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);

        const passwordKey = await window.crypto.subtle.importKey(
            'raw',
            passwordBuffer,
            {name: 'PBKDF2'},
            false,
            ['deriveKey'],
        );

        //derive AES-GCM key
        return window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt,
                iterations,
                hash: 'SHA-256',
            },
            passwordKey,
            {
                name: 'AES-GCM',
                length: 256,
            },
            true,
            ['encrypt', 'decrypt'],
        );
    }

    setupAutomationBackups(intervalDays = 5) {
        const userId = sessionStorage.getItem('currentUserId');
        if(!userId) return;

        const lastBackupKey = `lastAutoBackup_${userId}`;
        const lastBackup = localStorage.getItem(lastBackupKey);

        if(!lastBackup || new Date(lastBackup) < new Date(Date.now() - intervalDays * 24 * 60 * 60 * 1000)) {
            if(confirm('Would you like to create a backup of your encryption keys? This will help you recover your messages in case of data loss.')) {
                this.createBackup().then(success => {
                    if(success) {
                        localStorage.setItem(lastBackupKey, new Date().toISOString());
                    }
                });
            } else {
                localStorage.setItem(lastBackupKey, new Date().toISOString());
            }
        }
    }
}

export default function createKeyBackupManager(chatEncryption) {
    return new keyBackupManager(chatEncryption);
}