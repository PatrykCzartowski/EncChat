import React, { useEffect, useState } from 'react';
import Styles from './ProfileFriendsList.module.css';
import FriendListCard from './FriendListCard/FriendListCard';

export default function ProfileFriendsList({ accountID, friendData, chatData, onChangeOpenedChat, onUpdateCurrentlyOpenedChats }) {

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
        return lastMessage.content || 'No text'
    };

    const handleClick = (chatID) => {
        const openedChats = JSON.parse(localStorage.getItem('openedChats')) || [];
        
        if (!openedChats.includes(chatID)) {
            openedChats.push(chatID);
            localStorage.setItem('openedChats', JSON.stringify(openedChats));
        }

        onChangeOpenedChat(chatID);
        onUpdateCurrentlyOpenedChats();
    };

//TEST CODE

    const [friendsProfiles, setFriendsProfiles] = useState([]);

    const getFriendData = async (accountId) => {
        const dbUserFriendsIdsResponse = await fetch("api/account/get_friends_ids", {
            method: "POST", headers: {"Content-Type": "application/json",},
            body: JSON.stringify({id: accountId}),
        })
        const userFriendsIds = await dbUserFriendsIdsResponse.json();
        if(userFriendsIds)    {
            const userFriendsProfiles = [];
            userFriendsIds.forEach(async (friend) => {
                const dbFriendProfileDataResponse = await fetch("/api/account/get_profile", {
                    method: "POST", headers: {"Content-Type": "application/json",},
                    body: JSON.stringify({id: friend.friendId}),
                });
                const friendProfileData = await dbFriendProfileDataResponse.json();
                if(friendProfileData) {
                    userFriendsProfiles.push(friendProfileData);
                }
            });
            setFriendsProfiles(userFriendsProfiles);
        }
    }

    const getLastMessageForPrivateChat = async (userId, friendId) => {
        const lastMessageDbResponse = await fetch("/api/friend_list/private_chat/get_last_message", {
            method: "POST", headers: {"Content-Type": "application/json",},
            body: JSON.stringify({userId: userId, friendId: friendId}),
        });
        const lastMessage = await lastMessageDbResponse.json();
        return lastMessage;
    }

    useEffect(() => {
        getFriendData(accountID);
    }, [accountID]);
    
//TEST CODE

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
                {friendsProfiles.map(friendProfile => (
                    console.log(friendProfile),
                    <FriendListCard
                        key={friendProfile.id}
                        friendProfile={friendProfile}
                        lastMessage={getLastMessageForPrivateChat(accountID, friendProfile.accountId)}
//                        lastMessage={getLastMessage(friendProfile.chatID)}
//                        onClick={() => handleClick(friendProfile.chatID)}
                    />
                ))}
            </ul>
        </div>
    );
}
