import './UserPage.css';

import ProfileInfo from './UserPageComponents/ProfileInfo/ProfileInfo';
import ProfileSearchBar from './UserPageComponents/ProfileSearchBar/ProfileSearchBar';
import ProfileFriendsList from './UserPageComponents/ProfileFriendsList/ProfileFriendsList';
import Chat from './UserPageComponents/Chat/Chat';

import { useLocation } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';

export default function UserPage() {
  const location = useLocation();
  const account = location.state?.account;

  const [accountProfileData, setAccountProfileData] = useState({});
  const [accountFriendsList, setAccountFriendsList] = useState([]);
  const [accountFriendsData, setAccountFriendsData] = useState([]);
  const [accountChatsList, setAccountChatsList] = useState([]);
  const [accountChatsData, setAccountChatsData] = useState([]);
  const [chatAggregatedData, setChatAggregatedData] = useState({});
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
      <ProfileFriendsList accountID={account.id} chatData={chatAggregatedData} friendData={accountFriendsData} onChangeOpenedChat={handleChangeOpenedChat}/>
      <Chat 
        chatData={Array.isArray(chatAggregatedData) ? chatAggregatedData.filter(chatData => chatData.id === openedChat) : []}
        handleMessageSubmit={handleMessageSubmit}/>
      </div>
  );
}