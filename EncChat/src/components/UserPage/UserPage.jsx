import "./UserPage.css";
import { useEffect, useState } from "react";
import { useAuth } from "../../Auth/AuthProvider";
import { useNavigate, useLocation } from "react-router-dom";
import useWebSocket from "react-use-websocket";
import ProfileInfo from "./UserPageComponents/ProfileInfo/ProfileInfo";
import ProfileSearchBar from "./UserPageComponents/ProfileSearchBar/ProfileSearchBar";
import ProfileFriendsList from "./UserPageComponents/ProfileFriendsList/ProfileFriendsList";
import Chat from "./UserPageComponents/Chat/Chat";
import Settings from "./UserPageComponents/Settings/Settings";
import Profile from './UserPageComponents/Profile/Profile';
import Loading from "../Utils/Loading/Loading";
import chatEncryption from "../Utils/clientEncryption";
import KeyBackupUI from "../keyBackupUI/KeyBackupUI";
import BlockedUsersList from "../BlockedUsersList/BlockedUsersList";
import { ToastProvider, useToast } from "../../Alerts/ToastNotificationSystem";

const WS_URL = "ws://127.0.0.1:8080";

export default function UserPageWrapper() {
  return (
    <ToastProvider>
      <UserPage />
    </ToastProvider>
  );
}

function UserPage() {
  const toast = useToast();
  const location = useLocation();
  const { token, logOut } = useAuth();
  const navigate = useNavigate();

  // User states
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  
  // Data states
  const [userFriends, setUserFriends] = useState([]);
  const [userChats, setUserChats] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // UI states
  const [openedChat, setOpenedChat] = useState(null);
  const [currentOpenedChats, setCurrentOpenedChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [encryptionReady, setEncryptionReady] = useState(false); 
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [blockedUsersOpen, setBlockedUsersOpen] = useState(false);

  useEffect(() => {
    if (location.state?.userProfile) {
      setUserProfile(location.state.userProfile);
      setUserId(location.state.userProfile.accountId);
      sessionStorage.setItem('currentUserId', location.state.userProfile.accountId);
    }
    if(location.state?.accountId) {
      setUserId(location.state.accountId)
      sessionStorage.setItem('currentUserId', location.state.accountId);
    }
  }, [location.state?.userProfile, location.state?.accountId]);

  // Initialize encryption
  useEffect(() => {
    const initEncryption = async () => {
      if (userId) {
        try {
          await chatEncryption.init();
          setEncryptionReady(true);
          toast.success("Encryption initialized successfully");
        } catch (error) {
          toast.error("Failed to initialize encryption");
          console.error("Encryption initialization error:", error);
        }
      }
    }
  
    if (userId) {
      initEncryption();
    }
  }, [userId]);

  // WebSocket setup
  const { sendMessage, readyState } = useWebSocket(WS_URL, {
    queryParams: { token }, // Send token for authentication
    onOpen: async () => {
      toast.info("Connected to chat server");
      if(userId && encryptionReady) {
        await sendConnectWithKey();
      }
    },
    onClose: () => {
      toast.warning("Disconnected from chat server");
    },
    onError: () => {
      toast.error("Error connecting to chat server");
    },
    onMessage: (event) => handleWebSocketMessage(event),
  });

  // Send connection with public key
  const sendConnectWithKey = async () => {
    try {
      const publicKey = await chatEncryption.exportPublicKey();
      sendMessage(JSON.stringify({ 
        type: "CONNECT", 
        payload: { accountId: userId, publicKey } 
      }));
    } catch (error) {
      toast.error("Failed to send encryption key");
      console.error("Error sending public key:", error);
    }
  };

  //re-send CONNECT when encryption is ready or userId changes
  useEffect(() => {
    if(readyState === WebSocket.OPEN && userId && encryptionReady) sendConnectWithKey();
  }, [userId, encryptionReady, readyState]);

  // Authentication and data loading
  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    if(userId && encryptionReady) {
      fetchData();
      updateCurrentlyOpenedChats();
    }
  }, [token, userId, encryptionReady]);

  // API helpers
  const fetchAPI = async (url, payload, setState) => {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Send token for authentication
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        toast.error("Session expired. Please log in again.");
        logOut(); // Token expired
        return;
      }

      if (!response.ok) {
        toast.error(`Error: ${response.statusText}`);
        return;
      }

      const data = await response.json();
      if (data) setState(data);
    } catch (error) {
      toast.error(`Network error: ${error.message}`);
      console.error(`Error fetching ${url}:`, error);
    }
  };

  const fetchData = async () => {
    if (userId) {
      try {
        await Promise.all([fetchFriends(), fetchChats()]);
        setLoading(false);
        toast.success("Data loaded successfully");
      } catch (error) {
        toast.error("Failed to load user data");
        console.error("Error fetching user data:", error);
        logOut(); // Log out if token is invalid
      }
    }
  };

  const fetchFriends = () => fetchAPI("/api/friend/list", { userId: userId }, setUserFriends);
  const fetchChats = () => {
    fetchAPI("/api/chat/list", { userId: userId }, async (chatsData) => {
        if(!Array.isArray(chatsData)) {
          setUserChats(chatsData);
          return;
        }
      
        // Request missing chat keys
        await Promise.all(chatsData.map(async (chat) => {
          if(!chatEncryption.chatKeys[chat.id]) await requestChatKey(chat.id);
        }));

        // Process and decrypt messages
        const processedChats = await Promise.all(chatsData.map(async (chat) => {
          if(!chat.messages || !Array.isArray(chat.messages)) return chat;
        
          try {
            const decryptedMessages = await Promise.all(chat.messages.map(async (msg) => {
              try {
                const isEncrypted = typeof msg.content === "string" &&
                  (msg.content.includes('"iv":') && msg.content.includes('"data":'));

                if(isEncrypted) {
                  const decryptedContent = await chatEncryption.decryptMessage(chat.id, msg.content);
                  return { ...msg, content: decryptedContent };
                }
                return msg;
              } catch (e) {
                console.log(`Couldn't decrypt message in chat ${chat.id}:`, e);
                return msg;
              }
            }));
            return { ...chat, messages: decryptedMessages };
          } catch (error) {
            console.error(`Error processing chat ${chat.id}:`, error);
            return chat;
          }
        }));
        setUserChats(processedChats);
    });
  };

  // WebSocket message handling
  const handleWebSocketMessage = async (event) => {
    const message = JSON.parse(event.data);
    
    switch (message.type) {
      case "NEW_MESSAGE":
        await handleNewMessage(message.payload.payload);
        break;
      case "KEY_EXCHANGE":
        await handleKeyExchange(message.payload);
        toast.success("Chat key received");
        break;
      case "FRIEND_REQUEST":
        setNotifications((prev) => [...prev, { type: message.type, data: message.payload }]);
        toast.info("New friend request received");
      case "OTHER_NOTIFICATION":
        setNotifications((prev) => [...prev, { type: message.type, data: message.payload }]);
        toast.info("New notification received");
        break;
      case "FRIEND_CREATED":
        await handleNewFriend(message.payload);
        fetchFriends();
        fetchChats();
        toast.success("New friend added");
        break;
      case "CONNECTED":
        sessionStorage.setItem("wsClientId", message.payload.userId);
        break;
      case "REQUEST_KEY":
        await handleKeyRequest(message.payload);
        toast.info("Chat key requested");
        break;
      case "FRIEND_REMOVED":
        fetchFriends();
        toast.info("You have been removed from someone's friend list");
        break;
      case "FRIEND_REMOVAL_SUCCESSFUL":
        fetchFriends();
        toast.success("Friend removed successfully");
        break;
      case "USER_BLOCKED_SUCCESSFULLY":
        fetchFriends();
        toast.success("User blocked successfully");
        break;
      case "USER_UNBLOCKED_SUCCESSFULLY":
        toast.success("User unblocked successfully");
        break;
      default:
        break;
    }
  };

  const getChatName = (chatId) => {
    const chat = userChats.find(chat => chat.id === chatId);
    if (!chat) return "chat";
    return chat.name || "chat";
  };

  // Message handling
  const handleNewMessage = async (msg) => {

    let processedMsg = { ...msg };

    try {
      if(typeof msg.content === "string") {
        const isEncrypted = msg.content.includes('"iv":') && msg.content.includes('"data":');

        if(isEncrypted) {
          const decryptedContent = await chatEncryption.decryptMessage(msg.chatId, msg.content);
          processedMsg.content = decryptedContent;
        }
      }
    } catch (error) {
      toast.error(`Error decrypting message`);
//      console.log(`Error decrypting message in chat ${msg.chatId}:`, error);
    }

    setUserChats((prevData) =>
      prevData.map((chat) =>
        chat.id === msg.chatId
          ? {
              ...chat,
              messages: [...chat.messages, processedMsg],
              unreadCount: openedChat === msg.chatId ? 0 : (chat.unreadCount || 0) + 1,
            }
          : chat
      )
    );
  };

  const handleMessageSubmit = async (event) => {
    event.preventDefault();
    const messageContent = event.target[0].value;
    
    if (!messageContent.trim()) {
      toast.warning("Cannot send empty message");
      return;
    }

    try {
      const encryptedContent = await chatEncryption.encryptMessage(openedChat, messageContent);
      console.log("Encrypted content:", encryptedContent);

      if (!encryptedContent || typeof encryptedContent !== "string") {
        toast.error("Message encryption failed");
        console.error("Encryption failed: Invalid encrypted content", encryptedContent);
        return;
      }

      const payload = {
        type: "NEW_MESSAGE",
        payload: {
          chatId: openedChat,
          content: encryptedContent,
          authorId: userId,
          createdAt: new Date().toISOString(),
        },
      };

      if (readyState === WebSocket.OPEN) {
        sendMessage(JSON.stringify(payload));
        toast.success("Message sent");
      } else {
        toast.error("Not connected to server");
        console.error("WebSocket is not open. ReadyState:", readyState);
      }
    } catch (error) {
      toast.error("Failed to send message");
      console.error("Error sending encrypted message:", error);
    }

    event.target.reset();
  };

  // Key exchange and management
  const handleKeyExchange = async (payload) => {
    const {senderId, chatId, encryptedSymmetricKey } = payload;

    if(encryptedSymmetricKey) {
      try {
        console.log(`Attempting to decrypt key for chat ${chatId} from user ${senderId}`);
        const success = await chatEncryption.decryptChatKeyFromUser(
          chatId,
          encryptedSymmetricKey,
        );

        if(success) {
          console.log(`Successfully imported key for chat ${chatId} from user ${senderId}`);
          toast.success("Chat key imported successfully");
          fetchChats();
        } else {
          toast.error("Failed to import chat key");
          console.error(`Failed to import key for chat ${chatId} from user ${senderId}`);
        }
      } catch (error) {
        toast.error("Error importing chat key");
        console.error(`Error importing key for chat ${chatId} from user ${senderId}:`, error);
      }
    }
  };

  const handleKeyRequest = async (payload) => {
    const { chatId, requesterId } = payload;
    
    if (chatEncryption.chatKeys[chatId]) {
      try {
        const response = await fetch("/api/userKeys/public-key", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: requesterId }),
        });
        
        if (response.ok) {
          const { publicKey } = await response.json();
          if (publicKey) {
            const encryptedKey = await chatEncryption.encryptChatKeyForUser(chatId, publicKey);
            
            sendMessage(JSON.stringify({
              type: "KEY_EXCHANGE",
              payload: {
                targetUserId: requesterId,
                chatId,
                encryptedSymmetricKey: encryptedKey,
              }
            }));
            toast.success("Chat key shared");
          }
        } else {
          toast.error("Failed to get user's public key");
        }
      } catch (error) {
        toast.error("Error handling key request");
        console.error(`Error handling key request for chat ${chatId} from user ${requesterId}:`, error);
      }
    }
  };

  const handleNewFriend = async (payload) => {
    if(!payload.accountId || !payload.friendId) return;

    const isInitiator = payload.accountId === userId;
    const otherId = isInitiator ? payload.friendId : payload.accountId;

    try {
      const response = await fetch ("/api/userKeys/public-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: otherId }),
      });

      if(response.ok) {
          const { publicKey } = await response.json();
          if( publicKey ) {
              let chatId = null;

              const existingChat = userChats.find(chat => 
                  chat.participants &&
                  chat.participants.includes(otherId)
              );

          if( existingChat ) chatId = existingChat.id;
          
          if(chatId) {
              if (!chatEncryption.chatKeys[chatId] && isInitiator) {
                await chatEncryption.generateChatKey(chatId);
                const encryptedKey = await chatEncryption.encryptChatKeyForUser(chatId, publicKey);
  
                sendMessage(JSON.stringify({
                    type: "KEY_EXCHANGE",
                    payload: {
                      targetUserId: otherId,
                      chatId,
                      encryptedSymmetricKey: encryptedKey,
                    }
                }));
                toast.success("Chat key created and shared"); 
              }
          }
        }
      }
    } catch (error) {
      toast.error("Error exchanging keys with new friend");
      console.error(`Error exchanging keys with user ${otherId}:`, error);
    }
  }

  const requestChatKey = async (chatId) => {
    const chat = userChats.find(c => c.id === chatId);
    if (!chat || !chat.participants) return;
    const otherParticipants = chat.participants.filter(id => id !== userId);

    otherParticipants.forEach(participantId => {
      sendMessage(JSON.stringify({
        type: "REQUEST_KEY",
        payload: {
          targetUserId: participantId,
          chatId
        }
      }));
    });

    toast.info("Requested chat key from participants");
  }

  // UI handlers
  const handleChangeOpenedChat = (chatID) => {
    setOpenedChat(chatID);
    setUserChats((prevData) =>
      prevData.map((chat) => (chat.id === chatID ? { ...chat, unreadCount: 0 } : chat))
    );
    updateCurrentlyOpenedChats();

    const chat = userChats.find(chat => chat.id === chatID);
    if (chat) {
      toast.info(`Opened chat: ${chat.name || 'Chat'}`);
    }
  };

  const updateCurrentlyOpenedChats = () => {
    const openedChats = JSON.parse(localStorage.getItem('openedChats')) || [];

    const openedUserChats = Array.isArray(userChats)
  ? userChats.filter(chat => openedChats.includes(chat.id))
  : [];

    setCurrentOpenedChats(openedUserChats)
  }

  const toggleBlockedUsers = () => {
    setBlockedUsersOpen(!blockedUsersOpen);
    setSettingsOpen(false);
    setProfileOpen(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="loadingPage">
        <Loading />
      </div>
    );
  }

  // Main UI
  return (
    <div className="userPage">
      <div className="leftSection">
        <ProfileInfo 
          userId={userId} 
          profile={userProfile}
          setSettingsOpen={setSettingsOpen} 
          setProfileOpen={setProfileOpen}
          setBlockedUsersOpen={toggleBlockedUsers}
        />
        {encryptionReady && <KeyBackupUI />}
        <ProfileSearchBar
          userId={userId}
          friendData={userFriends}
          currentUserId={userId}
          socketUrl={WS_URL}
          sendMessage={sendMessage}
          toast={toast}
        />
        <ProfileFriendsList
          userId={userId}
          userFriends={userFriends}
          userChats={userChats}
          onChangeOpenedChat={handleChangeOpenedChat}
        />
      </div>
      <div className="rightSection">
      {settingsOpen ? (
        <Settings closeSettings={() => setSettingsOpen(false)} />
      ) : profileOpen ? (
        <Profile profile={userProfile} closeProfile={() => setProfileOpen(false)} />
      ) : blockedUsersOpen ? (
        <BlockedUsersList 
          userId={userId} 
          token={token} 
          sendMessage={sendMessage}
          onClose={() => setBlockedUsersOpen(false)}
          toast={toast} 
        />
      ) : (
          <Chat
            chatData={userChats.filter((chat) => chat.id === openedChat)}
            handleMessageSubmit={handleMessageSubmit}
            userId={userId}
            friendsData={userFriends}
            sendMessage={sendMessage}
            currentOpenedChats={currentOpenedChats}
            setCurrentOpenedChats={setCurrentOpenedChats}
            notifications={notifications}
            onChangeOpenedChat={setOpenedChat}
          />
        )}
      </div>
    </div>

  );
}
