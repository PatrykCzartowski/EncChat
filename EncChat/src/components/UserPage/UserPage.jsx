import './UserPage.css';

import ProfileInfo from './UserPageComponents/ProfileInfo/ProfileInfo';
import ProfileSearchBar from './UserPageComponents/ProfileSearchBar/ProfileSearchBar';
import ProfileFriendsList from './UserPageComponents/ProfileFriendsList/ProfileFriendsList';
import Chat from './UserPageComponents/Chat/Chat';

import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function UserPage() {
  const location = useLocation();
  const account = location.state?.account;

  const [accountProfileData, setAccountProfileData] = useState({});
  const [accountFriendsList, setAccountFriendsList] = useState([]);
  const [accountFriendsData, setAccountFriendsData] = useState({});
  const [accountChatsList, setAccountChatsList] = useState([]);
  const [accountChatsData, setAccountChatsData] = useState([]);
  const [accountMessagesList, setAccountMessagesList] = useState({});
  const [openedChat, setOpenedChat] = useState(null);
  const [socket, setSocket] = useState(null);

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
      if(profile) setAccountFriendsData((prevData) => ({ ...prevData, [friendID]: profile }));
    } catch (error) {
      console.error('Error getting friend profile:', error);
    }
  };

  const getChats = async (accountID) => {
    try {
      const response = await fetch('/api/account/get_chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: accountID }),
      });
      const chats = await response.json();
      if(chats) setAccountChatsList(chats);
    } catch (error) {
      console.error('Error getting chats:', error);
    }
  };

  const getChatMessages = async (chatID) => {
    try {
      const response = await fetch('/api/account/get_chat_messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: chatID }),
      });
      const messages = await response.json();
      if(messages) setAccountMessagesList((prevMessages) => ({ ...prevMessages, [chatID]: messages }));
    } catch (error) {
      console.error('Error getting messages:', error);
    }
  };

  useEffect(() => {
    if(account) {
      getAccountProfile(account.id);
      getAccountFriends(account.id);
      getChats(account.id);
    }
    accountFriendsList.length > 0 && accountFriendsList.forEach((friend) => getFriendProfile(friend.id));
    accountChatsList.length > 0 && accountChatsList.forEach((chat) => getChatMessages(chat.id));
  });

  useEffect(() => {
    const newSocket = new WebSocket('ws://localhost:5000');
    setSocket(newSocket);

    newSocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setUserMessagesList((prevMessages) => ({
        ...prevMessages,
        [message.chatID]: [...(prevMessages[message.chatID] || []), message]
      }));
    }

    return () => {
      if(newSocket.readyState === 1) {
        newSocket.close();
      }
    }
  }, []);

  const handleChangeOpenedChat = (chatID) => {
    setOpenedChat(chatID);
  }

  const getLastMessages = () => {
    const lastMessages = {};
    for(const chatID in accountMessagesList) {
      const messages = accountMessagesList[chatID];
      if(messages.length > 0) {
        lastMessages[chatID] = messages[messages.length - 1];
      }
    }
    return lastMessages;
  }

  const handleMessageSubmit = (event) => {
    event.preventDefault();
    const messageContent = event.target[0].value;
    const chatID = openedChat;
    const message = {
      chatID,
      content: messageContent,
      senderID: account.id,
    };
    if(WebSocket.readyState === WebSocket.OPEN) {
      WebSocket.send(JSON.stringify(message));
      console.log('Message sent');
    } else {
      console.log("WebSocket is not open. ReadyState: ", WebSocket.readyState);
    }

    event.target.reset();
  }

  return (
    <div>
      <ProfileInfo account={account} profile={accountProfileData}/>
      <ProfileSearchBar />
      <ProfileFriendsList friendData={accountFriendsData} lastMessages={getLastMessages()} onChangeOpenedChat={handleChangeOpenedChat}/>
      <Chat openedChat={openedChat} chatMessages={accountMessagesList[openedChat]} handleMessageSubmit={handleMessageSubmit}/>
      </div>
  );
}