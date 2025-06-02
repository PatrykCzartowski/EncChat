class ChatEncryption {
    constructor() {
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
      
    async fetchChatKey(chatId, token) {
      if (!this.initialized) await this.init();
      
      try {
        const response = await fetch("/api/chatKey/get", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ 
            chatId: parseInt(chatId),
            userId: parseInt(sessionStorage.getItem('currentUserId'))
          })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch chat key: ${response.statusText}`);
        }
        
        const { key } = await response.json();
        await this.importChatKey(chatId, key);
        return true;
      } catch (error) {
        console.error('Error fetching chat key:', error);
        return false;
      }
    }
    
    async generateChatKey(chatId, token) {
      if (!this.initialized) await this.init();
      
      try {
        const response = await fetch("/api/chatKey/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ chatId: parseInt(chatId) })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to generate chat key: ${response.statusText}`);
        }
        
        const { key } = await response.json();
        await this.importChatKey(chatId, key);
        return true;
      } catch (error) {
        console.error('Error generating chat key:', error);
        return false;
      }
    }
    
    async saveChatKeys() {
      const userId = sessionStorage.getItem('currentUserId');
      if (!userId) return;

      const chatKeysId = `chatKeys_${userId}`;
      const keysToSave = {};
      
      for (const chatId in this.chatKeys) {
        keysToSave[chatId] = this.chatKeys[chatId];
      }
      
      localStorage.setItem(chatKeysId, JSON.stringify(keysToSave));
    }
  
    async importChatKey(chatId, key) {
      try {
        this.chatKeys[chatId] = key;
        await this.saveChatKeys();
        return true;
      } catch (error) {
        console.error('Error importing chat key:', error);
        return false;
      }
    }
  
    async encryptMessage(chatId, message) {
      if (!this.initialized) await this.init();
      
      if (!this.chatKeys[chatId]) {
        throw new Error("No encryption key available for this chat");
      }
      
      try {
        // Use a simpler AES encryption with the hex key from the server
        const key = this.chatKeys[chatId];
        const iv = window.crypto.getRandomValues(new Uint8Array(16));
        const cryptoKey = await this._deriveKeyFromHex(key);
        
        const encodedMessage = new TextEncoder().encode(message);
        const encryptedData = await window.crypto.subtle.encrypt(
          {
            name: "AES-GCM",
            iv,
          },
          cryptoKey,
          encodedMessage
        );
        
        const result = {
          iv: Array.from(iv),
          data: Array.from(new Uint8Array(encryptedData))
        };
        
        return JSON.stringify(result);
      } catch (error) {
        console.error('Failed to encrypt message:', error);
        throw error;
      }
    }
  
    async decryptMessage(chatId, encryptedMessage) {
      if (!this.initialized) await this.init();
      
      if (!this.chatKeys[chatId]) {
        console.error(`No decryption key available for chat ${chatId}`);
        throw new Error("No decryption key for this chat");
      }
      
      try {
        const { iv, data } = JSON.parse(encryptedMessage);
        const key = this.chatKeys[chatId];
        const cryptoKey = await this._deriveKeyFromHex(key);
        
        const decryptedData = await window.crypto.subtle.decrypt(
          {
            name: "AES-GCM",
            iv: new Uint8Array(iv),
          },
          cryptoKey,
          new Uint8Array(data)
        );
        
        return new TextDecoder().decode(decryptedData);
      } catch (error) {
        console.error('Failed to decrypt message:', error);
        return "🔒 [Encrypted message - cannot decrypt]";
      }
    }
    
    async _deriveKeyFromHex(hexKey) {
      const keyData = new Uint8Array(hexKey.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
      
      return await window.crypto.subtle.importKey(
        "raw",
        keyData,
        {
          name: "AES-GCM",
          length: 256
        },
        false,
        ["encrypt", "decrypt"]
      );
    }
  }
  
  const chatEncryption = new ChatEncryption();
  export default chatEncryption;