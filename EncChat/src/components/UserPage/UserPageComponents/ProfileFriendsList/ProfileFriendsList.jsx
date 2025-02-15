import React, { useState } from 'react';
import Styles from './ProfileFriendsList.module.css';
import FriendListCard from './FriendListCard/FriendListCard';

export default function ProfileFriendsList({ userId, userFriends, userChats, onChangeOpenedChat }) {

    const [showGroupChats, setShowGroupChats] = useState(false);

    const getLastMessage = (chatID) => {
        let chatMessages;
        userChats.forEach(chat => {
            if (chat.id === chatID) {
                chatMessages = chat.messages;
            }
        });
        if (!chatMessages || chatMessages.length === 0) return 'No messages yet';
        const lastMessage = chatMessages[chatMessages.length - 1];
        return lastMessage.content || 'No text'
    };

    const handleClick = (chatID) => {
        const openedChats = JSON.parse(localStorage.getItem('openedChats')) || [];
        
        if (!openedChats.includes(chatID)) {
            openedChats.push(chatID);
            localStorage.setItem('openedChats', JSON.stringify(openedChats));
        }

        onChangeOpenedChat(chatID);
    };

    return (
        <div className={Styles.friendsListContainer}>
            <div className={Styles.toggleContainer}>
                <button
                    className={`${Styles.toggleButton} ${!showGroupChats ? Styles.active : ''}`}
                    onClick={() => setShowGroupChats(false)}
                >
                    Chats with Friends
                </button>
                <button
                    className={`${Styles.toggleButton} ${showGroupChats ? Styles.active : ''}`}
                    onClick={() => setShowGroupChats(true)}
                >
                    Group Chats
                </button>
            </div>

            <ul className={Styles.ulFriendList}>
                {Array.isArray(userChats)
                    ? userChats.map((chat) => {
                          if (!showGroupChats && !chat.group) {
                              const friendID = chat.accounts.filter(
                                  (account) => account !== userId
                              );
                              return (
                                  <div key={chat.id + 10} onClick={() => handleClick(chat.id)}>
                                      <FriendListCard
                                          key={chat.id}
                                          isGroup={false}
                                          userFriend={userFriends.filter(
                                              (data) => data.accountId === friendID[0]
                                          )}
                                          lastMessage={getLastMessage(chat.id)}
                                          unreadCount={chat.unreadCount}
                                      />
                                  </div>
                              );
                          } else if (showGroupChats && chat.group) {
                              const friendsID = chat.accounts.filter(
                                  (account) => account !== userId
                              );
                              return (
                                  <div key={chat.id + 10} onClick={() => handleClick(chat.id)}>
                                      <FriendListCard
                                          key={chat.id}
                                          chatID={chat.id}
                                          friendID={friendsID}
                                          isGroup={true}
                                          friendData={userFriends}
                                          lastMessage={getLastMessage(chat.id)}
                                          chatData={userChats.filter(
                                              (userChats) => userChats.id === chat.id
                                          )}
                                      />
                                  </div>
                              );
                          }
                          return null;
                      })
                    : 'No chat data available'}
            </ul>
        </div>
    );
}
