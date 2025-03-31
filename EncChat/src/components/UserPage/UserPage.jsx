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
import Loading from "../Utils/Loading/Loading";
import chatEncryption from "../Utils/clientEncryption";
import KeyBackupUI from "../keyBackupUI/KeyBackupUI";

const WS_URL = "ws://127.0.0.1:8080";

export default function UserPage() {
  const location = useLocation();
  const { token, logOut } = useAuth();
  const navigate = useNavigate();

  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userFriends, setUserFriends] = useState([]);
  const [userChats, setUserChats] = useState([]);
  const [openedChat, setOpenedChat] = useState(null);
  const [currentOpenedChats, setCurrentOpenedChats] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [encryptionReady, setEncryptionReady] = useState(false); 
  const [settingsOpen, setSettingsOpen] = useState(false);

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

  useEffect(() => {
    const initEncryption = async () => {
      if (userId) {
        await chatEncryption.init();
        setEncryptionReady(true);
      }
    }
  
    if (userId) {
      initEncryption();
    }
  }, [userId]);

  const { sendMessage, readyState } = useWebSocket(WS_URL, {
    queryParams: { token }, // Send token for authentication
    onOpen: async () => {
      if(userId && encryptionReady) {
        const publicKey = await chatEncryption.exportPublicKey();
        sendMessage(JSON.stringify({ type: "CONNECT", payload: { accountId: userId, publicKey } }));
      }
    },
    onMessage: (event) => handleWebSocketMessage(event),
  });

  //re-send CONNECT when encryption is ready or userId changes
  useEffect(() => {
    if(readyState === WebSocket.OPEN && userId && encryptionReady) {
      const sendConnectWithKey = async () => {
        const publicKey = await chatEncryption.exportPublicKey();
        sendMessage(JSON.stringify({ type: "CONNECT", payload: { accountId: userId, publicKey } }));
      }

      sendConnectWithKey();
    }
  }, [userId, encryptionReady, readyState]);

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

  const fetchData = async () => {
    if (userId) {
      try {
        await Promise.all([fetchFriends(), fetchChats()]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        logOut(); // Log out if token is invalid
      }
    }
  };

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
        logOut(); // Token expired
        return;
      }
      const data = await response.json();
      if (data) setState(data);
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
    }
  };

  const fetchFriends = () => {
    fetchAPI("/api/friend/list", { userId: userId }, setUserFriends);
  }
  const fetchChats = () => {
    fetchAPI("/api/chat/list", { userId: userId }, async (chatsData) => {
        if(Array.isArray(chatsData)) {
            // For each chat, check if we have the key; if not, request it
            await Promise.all(chatsData.map(async (chat) => {
              if(!chatEncryption.chatKeys[chat.id]) {
                await requestChatKey(chat.id);
              }
            }));

            const processedChats = await Promise.all(chatsData.map(async (chat) => {
                if(chat.messages && Array.isArray(chat.messages)) {
                    try {
                    const decryptedMessages = await Promise.all(chat.messages.map(async (msg) => {
                        try {
                            const isEncrypted = typeof msg.content === "string" &&
                            (msg.content.includes('"iv":') && msg.content.includes('"data":'));
              
                            if(isEncrypted) {
                                const decryptedMessages = await chatEncryption.decryptMessage(chat.id, msg.content);
                                return { ...msg, content: decryptedMessages };
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
                  }
                  return chat;
                }));

            setUserChats(processedChats);
        } else {
            setUserChats(chatsData);
        }
    });
  }

  const handleWebSocketMessage = async (event) => {
    const message = JSON.parse(event.data);
    
    switch (message.type) {
      case "NEW_MESSAGE":
        await handleNewMessage(message.payload.payload);
        break;
      case "KEY_EXCHANGE":
        await handleKeyExchange(message.payload);
        break;
      case "FRIEND_REQUEST":
      case "OTHER_NOTIFICATION":
        setNotifications((prev) => [...prev, { type: message.type, data: message.payload }]);
        break;
      case "FRIEND_CREATED":
        await handleNewFriend(message.payload);
        fetchFriends();
        fetchChats();
        break;
      case "CONNECTED":
        sessionStorage.setItem("wsClientId", message.payload.userId);
        break;
      case "REQUEST_KEY":
        await handleKeyRequest(message.payload);
        break; 
      default:
        break;
    }
  };

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
          fetchChats();
        } else {
          console.error(`Failed to import key for chat ${chatId} from user ${senderId}`);
        }
      } catch (error) {
        console.error(`Error importing key for chat ${chatId} from user ${senderId}:`, error);
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
              }
          }
        }
      }
    } catch (error) {
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
  }

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
      console.log(`Error decrypting message in chat ${msg.chatId}:`, error);
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
    
    try {
      const encryptedContent = await chatEncryption.encryptMessage(openedChat, messageContent);
      console.log("Encrypted content:", encryptedContent);

      if (!encryptedContent || typeof encryptedContent !== "string") {
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
      } else {
        console.error("WebSocket is not open. ReadyState:", readyState);
      }
    } catch (error) {
      console.error("Error sending encrypted message:", error);
    }

    event.target.reset();
  };

  const handleChangeOpenedChat = (chatID) => {
    setOpenedChat(chatID);
    setUserChats((prevData) =>
      prevData.map((chat) => (chat.id === chatID ? { ...chat, unreadCount: 0 } : chat))
    );
    updateCurrentlyOpenedChats();
  };

  const updateCurrentlyOpenedChats = () => {
    const openedChats = JSON.parse(localStorage.getItem('openedChats')) || [];

    const openedUserChats = Array.isArray(userChats)
  ? userChats.filter(chat => openedChats.includes(chat.id))
  : [];

    setCurrentOpenedChats(openedUserChats)
  }

  if (loading) {
    return (
      <div className="loadingPage">
        <Loading />
      </div>
    );
  }

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
          }
        }
      } catch (error) {
        console.error(`Error handling key request for chat ${chatId} from user ${requesterId}:`, error);
      }
    }
  };

  return (
    <div className="userPage">
      <div className="leftSection">
        <ProfileInfo userId={userId} profile={userProfile} setSettingsOpen={setSettingsOpen} />
        {encryptionReady && <KeyBackupUI />}
        <ProfileSearchBar
          userId={userId}
          friendData={userFriends}
          currentUserId={userId}
          socketUrl={WS_URL}
          sendMessage={sendMessage}
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
