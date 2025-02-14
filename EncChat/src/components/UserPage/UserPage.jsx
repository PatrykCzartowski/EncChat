import "./UserPage.css";
import { useEffect, useState } from "react";
import { useAuth } from "../../Auth/AuthProvider";
import { useNavigate, useLocation } from "react-router-dom";
import useWebSocket from "react-use-websocket";
import ProfileInfo from "./UserPageComponents/ProfileInfo/ProfileInfo";
import ProfileSearchBar from "./UserPageComponents/ProfileSearchBar/ProfileSearchBar";
import ProfileFriendsList from "./UserPageComponents/ProfileFriendsList/ProfileFriendsList";
import Chat from "./UserPageComponents/Chat/Chat";
import Loading from "../Utils/Loading/Loading";

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

  useEffect(() => {
    if (location.state?.userProfile) {
      setUserProfile(location.state.userProfile);
      setUserId(location.state.userProfile.accountId);
    }
    if(location.state?.accountId) {
      setUserId(location.state.accountId)
    }
  }, [location.state?.userProfile, location.state?.accountId]);

  const { sendMessage, readyState } = useWebSocket(WS_URL, {
    queryParams: { token }, // Send token for authentication
    onOpen: () => sendMessage(JSON.stringify({ type: "CONNECT", payload: { accountId: userId } })),
    onMessage: (event) => handleWebSocketMessage(event),
  });

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchData();
    updateCurrentlyOpenedChats();
  }, [token, userId]);

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
    fetchAPI("/api/chat/list", { userId: userId }, setUserChats);
  }

  const handleWebSocketMessage = (event) => {
    const message = JSON.parse(event.data);
    switch (message.type) {
      case "NEW_MESSAGE":
        handleNewMessage(message.payload.payload);
        break;
      case "FRIEND_REQUEST":
      case "OTHER_NOTIFICATION":
        setNotifications((prev) => [...prev, { type: message.type, data: message.payload }]);
        break;
      case "FRIEND_CREATED":
        fetchFriends();
        fetchChats();
        break;
      case "CONNECTED":
        sessionStorage.setItem("wsClientId", message.payload.userId);
        break;
      default:
        break;
    }
  };

  const handleNewMessage = (msg) => {
    setUserChats((prevData) =>
      prevData.map((chat) =>
        chat.id === msg.chatId
          ? {
              ...chat,
              messages: [...chat.messages, msg],
              unreadCount: openedChat === msg.chatId ? 0 : (chat.unreadCount || 0) + 1,
            }
          : chat
      )
    );
  };

  const handleMessageSubmit = (event) => {
    event.preventDefault();
    const messageContent = event.target[0].value;
    const payload = {
      type: "NEW_MESSAGE",
      payload: {
        chatId: openedChat,
        content: messageContent,
        authorId: userId,
        createdAt: new Date().toISOString(),
      },
    };

    if (readyState === WebSocket.OPEN) {
      sendMessage(JSON.stringify(payload));
    } else {
      console.error("WebSocket is not open. ReadyState:", readyState);
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

  return (
    <div className="userPage">
      <div className="leftSection">
        <ProfileInfo userId={userId} profile={userProfile} />
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
        <Chat
          chatData={userChats.filter((chat) => chat.id === openedChat)}
          handleMessageSubmit={handleMessageSubmit}
          userId={userId}
          friendsData={userFriends}
          sendMessage={sendMessage}
          currentOpenedChats = {currentOpenedChats}
          setCurrentOpenedChats={setCurrentOpenedChats}
          notifications={notifications}
          onChangeOpenedChat={handleChangeOpenedChat}
        />
      </div>
    </div>

  );
}
