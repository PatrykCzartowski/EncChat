import './UserPage.css';
import useWebSocket from 'react-use-websocket';
import ProfileInfo from './UserPageComponents/ProfileInfo/ProfileInfo';
import ProfileSearchBar from './UserPageComponents/ProfileSearchBar/ProfileSearchBar';
import ProfileFriendsList from './UserPageComponents/ProfileFriendsList/ProfileFriendsList';
import Chat from './UserPageComponents/Chat/Chat';

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
  const [openedChat, setOpenedChat] = useState(null);
  const [currentOpenedChats, setCurrentOpenedChats] = useState([]);

  const {sendMessage, lastMessage, readyState} = useWebSocket(WS_URL, {
    onOpen: () => {
      console.log('Websocket connection established.')
    },
    onMessage: (event) => {
      const message = JSON.parse(event.data);
      if(message.type === 'NEW_MESSAGE') {
        setChatAggregatedData((prevData) => {
          return prevData.map(chat => {
            if(chat.id === message.payload.payload.chatId) {
              const isCurrentChatOpen = openedChat === message.payload.payload.chatId;
              return {
                ...chat,
                messages: [...chat.messages, message.payload.payload],
                unreadCount: isCurrentChatOpen ? 0 : (chat.unreadCount || 0) +1,                
              }
            }
            return chat;
          });
        });
      } else if (message.type === 'FRIEND_CREATED') {
        getAccountFriends(account.id);
        getAggregatedChatData(account.id);
      }
    }
  });

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
        setAccountFriendsData((prevData) => {
          // Check if the profile already exists in the array
          if (!prevData.some(friend => friend.id === profile.id)) {
            return [...prevData, profile];
          }
          return prevData;
        });
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
    if(res) setChatAggregatedData(res);
  }

  useEffect(() => {
    if(account) {
      getAggregatedChatData(account.id);
    }

  }, [account]);

  const handleChangeOpenedChat = (chatID) => {
    setOpenedChat(chatID);
    setChatAggregatedData((prevData) => 
      prevData.map(chat =>
        chat.id === chatID ? { ...chat, unreadCount: 0 } : chat
      )
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
    console.log(currentOpenedChats)
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
        />
      </div>
    </div>
  );
}