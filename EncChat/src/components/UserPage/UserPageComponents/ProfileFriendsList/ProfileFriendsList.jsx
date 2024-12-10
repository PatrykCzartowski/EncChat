import React, { useState } from 'react';
import Styles from './ProfileFriendsList.module.css';
import FriendListCard from './FriendListCard/FriendListCard';

export default function ProfileFriendsList({ accountID, friendData, chatData, onChangeOpenedChat }) {
    const [showGroupChats, setShowGroupChats] = useState(false);

    const getLastMessage = (chatID) => {
        let chatMessages;
        chatData.forEach(chat => {
            if (chat.id === chatID) {
                chatMessages = chat.messages;
            }
        });
        if (!chatMessages || chatMessages.length === 0) return 'No messages yet';
        const lastMessage = chatMessages[chatMessages.length - 1];
        return lastMessage.text || 'No text'
    };

    const handleClick = (chatID) => {
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

            <ul>
                {Array.isArray(chatData)
                    ? chatData.map((chat) => {
                          if (!showGroupChats && !chat.group) {
                              const friendID = chat.accounts.filter(
                                  (account) => account !== accountID
                              );
                              return (
                                  <div key={chat.id + 10} onClick={() => handleClick(chat.id)}>
                                      <FriendListCard
                                          key={chat.id}
                                          chatID={chat.chatId}
                                          friendID={friendID[0]}
                                          isGroup={false}
                                          friendData={friendData.filter(
                                              (data) => data.accountId === friendID[0]
                                          )}
                                          lastMessage={getLastMessage(chat.id)}
                                      />
                                  </div>
                              );
                          } else if (showGroupChats && chat.group) {
                              const friendsID = chat.accounts.filter(
                                  (account) => account !== accountID
                              );
                              return (
                                  <div key={chat.id + 10} onClick={() => handleClick(chat.id)}>
                                      <FriendListCard
                                          key={chat.id}
                                          chatID={chat.id}
                                          friendID={friendsID}
                                          isGroup={true}
                                          friendData={friendData}
                                          lastMessage={getLastMessage(chat.id)}
                                          chatData={chatData.filter(
                                              (chatData) => chatData.id === chat.id
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
