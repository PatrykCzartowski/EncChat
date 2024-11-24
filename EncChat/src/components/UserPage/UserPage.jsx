import './UserPage.css';

import ProfileInfo from './UserPageComponents/ProfileInfo/ProfileInfo';
import ProfileSearchBar from './UserPageComponents/ProfileSearchBar/ProfileSearchBar';
import ProfileFriendsList from './UserPageComponents/ProfileFriendsList/ProfileFriendsList';
import Chat from './UserPageComponents/Chat/Chat';

import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function UserPage() {
  const location = useLocation();
  const user = location.state?.user;

  const [userProfileData, setUserProfileData] = useState({});
  const [userFriendsList, setUserFriendsList] = useState([]);
  const [userFriendsData, setUserFriendsData] = useState({});
  const [userChatsList, setUserChatsList] = useState([]);
  const [userChatsData, setUserChatsData] = useState([]);
  const [userMessagesList, setUserMessagesList] = useState({});
  const [openedChat, setOpenedChat] = useState(null);
  const [socket, setSocket] = useState(null);

  const getUserProfileData = async (userID) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({userID}),
      });
      const res = await response.json();
      if(res.profile) {
        return res.profile; 
      } else {
        throw new Error(res.message || 'Profile not found');
      }
    } catch (error) {
      console.error('Error in getUserProfileData during user fetch: ', error);
    }
  }

  const getUserFriendsList = async (userID) => {
    try {
      const response = await fetch('/api/user/friends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({userID}),
      });
      const res = await response.json();
      if(res.friends) {
        return res.friends; 
      } else {
        throw new Error(res.message || 'Friends not found');
      }
    } catch (error) {
      console.error('Error in getUserFriend during user fetch: ', error);
    }
  }

  const getUserFriendData = async (friendID) => {
    try {
      const response = await fetch('/api/user/friend/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({friendID}),
      });
      const res = await response.json();
      if(res.friendData) {
        return res.friendData; 
      } else {
        throw new Error(res.message || 'Friend data not found');
      }
    } catch (error) {
      console.error('Error in getUserFriendData during user fetch: ', error);
    }
  }
 
  const getChatID = async (userID, friendID) => {
    try {
      const response = await fetch('/api/user/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({userID, friendID}),
      });
      const res = await response.json();
      if(res.chatID) {
        return res.chatID; 
      } else {
        throw new Error(res.message || 'Chat not found');
      }
    } catch (error) {
      console.error('Error in getChatID during user fetch: ', error);
    }
  };

  const getChatMessages = async (chatID) => {
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({chatID}),
      });
      const res = await response.json();
      if(res.messages) {
        return res.messages; 
      } else {
        throw new Error(res.message || 'Chat data not found');
      }
    } catch (error) {
      console.error('Error in getChatData during user fetch: ', error);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
        if (user) {
            try {
                const profileData = await getUserProfileData(user.id);
                setUserProfileData(profileData);

                if (profileData) {
                    const friendsList = await getUserFriendsList(user.id);
                    const friendsData = await Promise.all(friendsList.map(async (friendID) => {
                        const friendData = await getUserFriendData(friendID);
                        const chatID = await getChatID(user.id, friendID);
                        return { [friendID]: { ...friendData, chatID } };
                    }));

                    const friendsDataObject = friendsData.reduce((acc, friendData) => ({
                        ...acc,
                        ...friendData
                    }), {});

                    setUserFriendsData(friendsDataObject);

                    const messagesList = await Promise.all(friendsList.map(async (friendID) => {
                        const chatID = await getChatID(user.id, friendID);
                        const chatMessages = await getChatMessages(chatID);
                        return { [chatID]: chatMessages };
                    }));

                    const messagesListObject = messagesList.reduce((acc, messages) => ({
                        ...acc,
                        ...messages
                    }), {});

                    setUserMessagesList(messagesListObject);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        }
    };

    fetchData();
}, [user]);

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
    for(const chatID in userMessagesList) {
      const messages = userMessagesList[chatID];
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
      senderID: user.id,
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
      <ProfileInfo user={user} profile={userProfileData}/>
      <ProfileSearchBar />
      <ProfileFriendsList friendData={userFriendsData} lastMessages={getLastMessages()} onChangeOpenedChat={handleChangeOpenedChat}/>
      <Chat openedChat={openedChat} chatMessages={userMessagesList[openedChat]} handleMessageSubmit={handleMessageSubmit}/>
      </div>
  );
}