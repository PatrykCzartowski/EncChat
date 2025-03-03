class ChatEncryption {
    constructor() {
      this.keyPair = null;
      this.chatKeys = {};
      this.initialized = false;
    }
  
    async init() {
      try {
        const savedKeyPair = sessionStorage.getItem('userKeyPair');
        if (savedKeyPair) {
          await this.importKeyPair(savedKeyPair);
        } else {
          await this.generateKeyPair();
          
          const exportedKeys = await this.exportKeyPair();
          sessionStorage.setItem('userKeyPair', exportedKeys);
        }
        
        const savedChatKeys = localStorage.getItem('chatKeys');
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
  
    async generateChatKey(chatId) {
      if (!this.initialized) await this.init();
      
      if(this.chatKeys[chatId]) {
        await this.saveChatKeys();
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
      const exportedKeys = {};
      
      for (const chatId in this.chatKeys) {
        const exportedKey = await window.crypto.subtle.exportKey(
          "raw",
          this.chatKeys[chatId]
        );
        exportedKeys[chatId] = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
      }
      
      localStorage.setItem('chatKeys', JSON.stringify(exportedKeys));
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
      if (!this.initialized) await this.init();
      
      const key = await window.crypto.subtle.importKey(
        "raw",
        Uint8Array.from(atob(keyData), c => c.charCodeAt(0)),
        {
          name: "AES-GCM",
          length: 256
        },
        true,
        ["encrypt", "decrypt"]
      );
      
      this.chatKeys[chatId] = key;
      await this.saveChatKeys();
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
        throw new Error("No decryption key for this chat");
      }
      
      try {
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
      } catch (error) {
        console.error('Failed to decrypt message:', error);
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
  }

  const chatEncryption = new ChatEncryption();
  export default chatEncryption;