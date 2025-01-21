import './UserPage.css';
import useWebSocket from 'react-use-websocket';
import ProfileInfo from './UserPageComponents/ProfileInfo/ProfileInfo';
import ProfileSearchBar from './UserPageComponents/ProfileSearchBar/ProfileSearchBar';
import ProfileFriendsList from './UserPageComponents/ProfileFriendsList/ProfileFriendsList';
import Chat from './UserPageComponents/Chat/Chat';
import Loading from '../Utils/Loading/Loading';
import Logo from '../Logo/Logo';

import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const WS_URL = 'ws://127.0.0.1:8080';

export default function UserPage() {
  const location = useLocation();
  const account = location.state?.account;

  const [accountProfileData, setAccountProfileData] = useState({});
  const [accountFriendsList, setAccountFriendsList] = useState([]);
  const [accountFriendsData, setAccountFriendsData] = useState([]);
  const [chatAggregatedData, setChatAggregatedData] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [openedChat, setOpenedChat] = useState(null);
  const [currentOpenedChats, setCurrentOpenedChats] = useState([]);
  const [loading, setLoading] = useState(true);

  const {sendMessage, lastMessage, readyState} = useWebSocket(WS_URL, {
    onOpen: () => {
      sendMessage(JSON.stringify({ type: 'CONNECT', payload: { accountId: account.id } }));
    },
    onMessage: (event) => {
      const message = JSON.parse(event.data);
      if(message.type === 'NEW_MESSAGE') {
        setChatAggregatedData((prevData) => {
          const updatedData = prevData.map(chat => {
            if(chat.id === message.payload.payload.chatId) {
              const isCurrentChatOpen = openedChat === message.payload.payload.chatId;
              const updatedChat = {
                ...chat,
                messages: [...chat.messages, message.payload.payload],
                unreadCount: isCurrentChatOpen ? 0 : (chat.unreadCount || 0) +1,                
              }
              saveUnreadCountsToLocalStorage(updatedChat.id, updatedChat.unreadCount+1);

              return updatedChat;
            }
            return chat;
          });
          return updatedData;
        });
      } else if(message.type === 'FRIEND_REQUEST') {
        setNotifications((prev) => [...prev, { type: 'FRIEND_REQUEST', data: message.payload }]);
        
      } else if(message.type === 'OTHER_NOTIFICATION') {
        setNotifications((prev) => [...prev, { type: 'OTHER_NOTIFICATION', data: message.payload }]);
      } else if (message.type === 'FRIEND_CREATED') {
        getAccountFriends(account.id);
        getAggregatedChatData(account.id);
      } else if (message.type === 'CONNECTED') {
        sessionStorage.setItem('wsClientId', message.payload.userId);
      }
    }
  });

  const saveUnreadCountsToLocalStorage = (chatId, unreadCount) => {
    const unreadCounts = JSON.parse(localStorage.getItem('unreadCounts')) || {};
    unreadCounts[chatId] = unreadCount;
    localStorage.setItem('unreadCounts', JSON.stringify(unreadCounts));
  };
  
  const loadUnreadCountsFromLocalStorage = () => {
    return JSON.parse(localStorage.getItem('unreadCounts')) || {};
  };

  const getAccountProfile = async (accountID) => {
    try {
      const response = await fetch('/api/account/get_profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: accountID }),
      });
      const profile = await response.json();
      if(profile) setAccountProfileData(profile);
    } catch (error) {
      console.error('Error getting profile:', error);
    }
  };

  const getAccountFriends = async (accountID) => {
    try {
      const response = await fetch('/api/account/get_friends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: accountID }),
      });
      const friends = await response.json();
      if(friends) setAccountFriendsList(friends);
    } catch (error) {
      console.error('Error getting friends:', error);
    }
  };

  const getFriendProfile = async (friendID) => {
    try {
      const response = await fetch('/api/account/get_friend_profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: friendID }),
      });
      const profile = await response.json();
      if(profile) {
        const webSocketSessionToken = await fetch('/api/session/get_session_id_by_account_id', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: profile.accountId })
        })
        if(webSocketSessionToken) {
          setAccountFriendsData((prevData) => {
            if (!prevData.some(friend => friend.id === profile.id)) {
              return [
                ...prevData, 
                profile,
                webSocketSessionToken,
              ];
            }
            return prevData;
          })
        } else {
          setAccountFriendsData((prevData) => {
            if (!prevData.some(friend => friend.id === profile.id)) {
              return [...prevData, profile];
            }
            return prevData;
          });
        }
      }
    } catch (error) {
      console.error('Error getting friend profile:', error);
    }
  };

  useEffect(() => {
    if(account) {
      getAccountProfile(account.id);
      getAccountFriends(account.id);
    }
  }, [account]);

  useEffect(() => {
    if(accountFriendsList.length > 0) {
      accountFriendsList.forEach((friend) => {
        getFriendProfile(friend.friendId);
      });
    }
  }, [accountFriendsList]);

  const getAggregatedChatData = async (accountID) => {
    const response = await fetch('/api/account/get_aggregated_chat_data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: accountID }),
    });
    const res = await response.json();
    if(res) {
        const unreadCounts = loadUnreadCountsFromLocalStorage();
        const updatedChatData = res.map(chat => ({
          ...chat,
          unreadCount: unreadCounts[chat.id] || 0,
        }));
        setChatAggregatedData(updatedChatData);
    }
  }

  useEffect(() => {
    if(account) {
      const fetchData = async () => {
        await getAccountProfile(account.id);
        await getAccountFriends(account.id);
        await getAggregatedChatData(account.id);

        await Promise.all(
          accountFriendsList.map((friend) => getFriendProfile(friend.friendId))
        );

        setLoading(false);
      }
      fetchData();
    }

  }, [account]);

  const handleChangeOpenedChat = (chatID) => {
    setOpenedChat(chatID);
    setChatAggregatedData((prevData) => 
      prevData.map(chat => {
        if(chat.id === chatID) {
          saveUnreadCountsToLocalStorage(chatID, 0);
          return { ...chat, unreadCount: 0 };
        }
        return chat;
      })
    );
  }

  const handleMessageSubmit = (event) => {
    event.preventDefault();
    const messageContent = event.target[0].value;
    const chatID = openedChat;
    const payload = {
      type: 'NEW_MESSAGE',
      payload: {
        chatId: chatID,
        content: messageContent,
        authorId: account.id,
        createdAt: new Date().toISOString(),
      }
    }
    if(readyState === WebSocket.OPEN) {
      sendMessage(JSON.stringify(payload));
      console.log('Message sent');
    } else {
      console.log("WebSocket is not open. ReadyState: ", readyState);
    }

    event.target.reset();
  };

  const updateCurrentlyOpenedChats = () => {
    const openedChats = JSON.parse(localStorage.getItem('openedChats')) || [];

    const openedChatAggregatedData = Array.isArray(chatAggregatedData)
  ? chatAggregatedData.filter(chat => openedChats.includes(chat.id))
  : [];

    setCurrentOpenedChats(openedChatAggregatedData)
  }

  if (loading) {
    return (
      <div className='loadingPage'>
        <Loading />
      </div>
    );
  }
  
  return (
    <div className="userPage">
      <div className="leftSection">
      <ProfileInfo account={account} profile={accountProfileData}/>
      <ProfileSearchBar 
        accountId={account.id} 
        friendData={accountFriendsData} 
        currentUserId={account.id} 
        socketUrl={WS_URL}
        sendMessage={sendMessage}
      />
      <ProfileFriendsList accountID={account.id} chatData={chatAggregatedData} friendData={accountFriendsData} onChangeOpenedChat={handleChangeOpenedChat} onUpdateCurrentlyOpenedChats={updateCurrentlyOpenedChats}/>
      </div>
      <div className="rightSection">
      <Chat 
        chatData={Array.isArray(chatAggregatedData) ? chatAggregatedData.filter(chatData => chatData.id === openedChat) : []}
        handleMessageSubmit={handleMessageSubmit}
        accountId={account.id}
        friendsData = {accountFriendsData}
        sendMessage={sendMessage}
        currentOpenedChats = {currentOpenedChats}
        onChangeOpenedChat={handleChangeOpenedChat}
        setCurrentOpenedChats={setCurrentOpenedChats}
        notifications={notifications}
        />
      </div>
    </div>
  );
}