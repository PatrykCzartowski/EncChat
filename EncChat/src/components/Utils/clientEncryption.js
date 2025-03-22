class ChatEncryption {
    constructor() {
      this.keyPair = null;
      this.chatKeys = {};
      this.initialized = false;
    }
  
    async init() {
      try {
        const userId = sessionStorage.getItem('currentUserId');
        if (!userId) {
          console.error('No user ID available for encryption initialization');
          return false;
        }
        const keyStorageId = `userKeyPair_${userId}`;
        const savedKeyPair = sessionStorage.getItem(keyStorageId);
        if (savedKeyPair) {
          await this.importKeyPair(savedKeyPair);
        } else {
          await this.generateKeyPair();
          
          const exportedKeys = await this.exportKeyPair();
          sessionStorage.setItem(keyStorageId, exportedKeys);
        }
        
        const chatKeysId = `chatKeys_${userId}`;
        const savedChatKeys = localStorage.getItem(chatKeysId);
        if (savedChatKeys) {
          const chatKeysData = JSON.parse(savedChatKeys);
          for (const chatId in chatKeysData) {
            await this.importChatKey(chatId, chatKeysData[chatId]);
          }
        }
        
        this.initialized = true;
        return true;
      } catch (error) {
        console.error('Error initializing encryption:', error);
        return false;
      }
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
      return keyPair;
    }
  

    async exportPublicKey() {
      if (!this.keyPair) {
        await this.init();
      }
      
      const exportedKey = await window.crypto.subtle.exportKey(
        "spki",
        this.keyPair.publicKey
      );
      
      return btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
    }

    async exportKeyPair() {
      if (!this.keyPair) {
        throw new Error("No key pair available");
      }
      
      const publicKey = await window.crypto.subtle.exportKey(
        "spki",
        this.keyPair.publicKey
      );
      
      const privateKey = await window.crypto.subtle.exportKey(
        "pkcs8",
        this.keyPair.privateKey
      );
      
      return JSON.stringify({
        publicKey: btoa(String.fromCharCode(...new Uint8Array(publicKey))),
        privateKey: btoa(String.fromCharCode(...new Uint8Array(privateKey)))
      });
    }
    
    async importKeyPair(serializedKeyPair) {
      const { publicKey, privateKey } = JSON.parse(serializedKeyPair);
      
      const importedPublicKey = await window.crypto.subtle.importKey(
        "spki",
        Uint8Array.from(atob(publicKey), c => c.charCodeAt(0)),
        {
          name: "RSA-OAEP",
          hash: "SHA-256"
        },
        true,
        ["encrypt"]
      );
      
      const importedPrivateKey = await window.crypto.subtle.importKey(
        "pkcs8",
        Uint8Array.from(atob(privateKey), c => c.charCodeAt(0)),
        {
          name: "RSA-OAEP",
          hash: "SHA-256"
        },
        true,
        ["decrypt"]
      );
      
      this.keyPair = {
        publicKey: importedPublicKey,
        privateKey: importedPrivateKey
      };
    }
  
    async generateChatKey(chatId, existingKey = null) {
      if (!this.initialized) await this.init();
      
      if(this.chatKeys[chatId]) {
        await this.saveChatKeys();
        return this.chatKeys[chatId];
      }

      if(existingKey) {
        await this.importChatKey(chatId, existingKey);
        return this.chatKeys[chatId];
      }

      const key = await window.crypto.subtle.generateKey(
        {
          name: "AES-GCM",
          length: 256,
        },
        true,
        ["encrypt", "decrypt"]
      );
      
      this.chatKeys[chatId] = key;
      await this.saveChatKeys();
      return key;
    }
    
    async saveChatKeys() {
      const userId = sessionStorage.getItem('currentUserId');
      if (!userId) return;

      const chatKeysId = `chatKeys_${userId}`;
      const exportedKeys = {};
      
      for (const chatId in this.chatKeys) {
        const exportedKey = await window.crypto.subtle.exportKey(
          "raw",
          this.chatKeys[chatId]
        );
        exportedKeys[chatId] = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
      }
      
      localStorage.setItem(chatKeysId, JSON.stringify(exportedKeys));
    }
  
    async exportChatKey(chatId) {
      if (!this.initialized) await this.init();
      
      if (!this.chatKeys[chatId]) {
        await this.generateChatKey(chatId);
      }
      
      const exportedKey = await window.crypto.subtle.exportKey(
        "raw",
        this.chatKeys[chatId]
      );
      
      return btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
    }
  
    async importChatKey(chatId, keyData) {
      try {
        if (!this.initialized) await this.init();
        
        // Handle different key formats - sometimes keys might be nested JSON
        let processedKeyData = keyData;
        if (keyData.startsWith('{') && keyData.endsWith('}')) {
          try {
            const parsedData = JSON.parse(keyData);
            // If this is a complex object with the actual key inside
            if (parsedData.key) {
              processedKeyData = parsedData.key;
            }
          } catch (e) {
            console.warn(`Key data appears to be JSON but couldn't be parsed:`, e);
          }
        }
        
        const key = await window.crypto.subtle.importKey(
          "raw",
          Uint8Array.from(atob(processedKeyData), c => c.charCodeAt(0)),
          {
            name: "AES-GCM",
            length: 256
          },
          true,
          ["encrypt", "decrypt"]
        );
        
        this.chatKeys[chatId] = key;
        await this.saveChatKeys();
        return true;
      } catch (error) {
        return false;
      }
    }
  
    async encryptMessage(chatId, message) {
      if (!this.initialized) await this.init();
      
      if (!this.chatKeys[chatId]) {
        await this.generateChatKey(chatId);
      }
      
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encodedMessage = new TextEncoder().encode(message);
      
      const encryptedData = await window.crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv,
        },
        this.chatKeys[chatId],
        encodedMessage
      );
      
      const result = {
        iv: Array.from(iv),
        data: Array.from(new Uint8Array(encryptedData))
      };
      
      return JSON.stringify(result);
    }
  
    async decryptMessage(chatId, encryptedMessage) {
      if (!this.initialized) await this.init();
      
      if (!this.chatKeys[chatId]) {
        console.error(`No decryption key available for chat ${chatId}`);
        throw new Error("No decryption key for this chat");
      }
      
      console.log(`Chat keys available: ${Object.keys(this.chatKeys).join(', ')}`);
      console.log(`Attempting to decrypt message for chat ${chatId}, key exists: ${!!this.chatKeys[chatId]}`);

      try {
        const { iv, data } = JSON.parse(encryptedMessage);
        
        if (!iv || !data) {
          console.error('Invalid encrypted message format:', encryptedMessage);
          throw new Error("Invalid encrypted message format");
        }

        const decryptedData = await window.crypto.subtle.decrypt(
          {
            name: "AES-GCM",
            iv: new Uint8Array(iv),
          },
          this.chatKeys[chatId],
          new Uint8Array(data)
        );
        
        return new TextDecoder().decode(decryptedData);
      } catch (error) {
        console.error('Failed to decrypt message:', error);
        console.error('Encrypted message:', encryptedMessage);
        return "🔒 [Encrypted message - cannot decrypt]";
      }
    }
  
    async encryptChatKeyForUser(chatId, recipientPublicKey) {
      if (!this.initialized) await this.init();
      
      if (!this.chatKeys[chatId]) {
        await this.generateChatKey(chatId);
      }
      
      const exportedKey = await this.exportChatKey(chatId);
      
      const publicKey = await window.crypto.subtle.importKey(
        "spki",
        Uint8Array.from(atob(recipientPublicKey), c => c.charCodeAt(0)),
        {
          name: "RSA-OAEP",
          hash: "SHA-256"
        },
        false,
        ["encrypt"]
      );
      
      const encryptedKey = await window.crypto.subtle.encrypt(
        {
          name: "RSA-OAEP"
        },
        publicKey,
        new TextEncoder().encode(exportedKey)
      );
      
      return btoa(String.fromCharCode(...new Uint8Array(encryptedKey)));
    }

    async decryptChatKeyFromUser(chatId, encryptedKey) {
      if (!this.initialized) await this.init();
      
      try {
        const keyData = await window.crypto.subtle.decrypt(
          {
            name: "RSA-OAEP"
          },
          this.keyPair.privateKey,
          Uint8Array.from(atob(encryptedKey), c => c.charCodeAt(0))
        );
        
        const keyString = new TextDecoder().decode(keyData);
        await this.importChatKey(chatId, keyString);
        return true;
      } catch (error) {
        console.error('Failed to decrypt chat key:', error);
        return false;
      }
    }

    async joinChat(chatId, isCreator = false, creatorPublicKey = null) {
      if (!this.initialized) await this.init();

      if (isCreator) {
        await this.generateChatKey(chatId);
        return {
          chatId,
          status: 'created',
          publicKey: await this.exportPublicKey()
        };
      }
      else if (creatorPublicKey) {
        return {
          chatId,
          status: 'joining',
          publicKey: await this.exportPublicKey(),
        };
      } else {
        throw new Error("Cannot join chat - missing creator's public key");
      }
    }

    async exchangeKeys(chatId, participants) {
      if (!this.initialized) await this.init();

      if (!this.chatKeys[chatId]) {
        await this.generateChatKey(chatId);
      }

      const encryptedKeys = {};
      for (const participantId in participants) {
        const publicKey = participants[participantId];
        encryptedKeys[participantId] = await this.encryptChatKeyForUser(chatId, publicKey);
      }

      return encryptedKeys;
    }

  }

  const chatEncryption = new ChatEncryption();
  export default chatEncryption;