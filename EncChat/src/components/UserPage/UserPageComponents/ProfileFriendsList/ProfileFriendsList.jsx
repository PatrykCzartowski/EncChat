import './ProfileFriendsList.css';

import FriendListCard from './FriendListCard/FriendListCard';

import { useEffect, useState } from 'react';

export default function ProfileFriendsList({ user }) {
    const [friends, setFriends] = useState([]);
    const [lastMessages, setLastMessages] = useState([]);

    useEffect(() => {
        const getFriends = async (user) => {
            try {
                const response = await fetch('/api/user/friends', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(user),
                });
                const res = await response.json();
                if (res.friends) {
                    return res.friends;
                } else {
                    throw new Error(res.message || 'Friends not found');
                }
            } catch (error) {
                console.error('Error during friends fetch: ', error);
            }
        }

        const getLastMessage = async ( userID, friendID ) => {
            try {
                const response = await fetch('/api/messages/last', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userID, friendID }),
                });
                const res = await response.json();
                if (res.message) {
                    return res.message;
                } else {
                    throw new Error(res.message || 'Last message not found');
                }
            } catch (error) {
                console.error('Error during last message fetch: ', error);
            }
        }

        const fetchFriendsAndMessages = async () => {
            if (user) {
              const friendsList = await getFriends(user);
              setFriends(friendsList);
      
              const messages = await Promise.all(
                friendsList.map(async (friend) => {
                  const message = await getLastMessage(user.id, friend.id);
                  return { friendID: friend.id, message };
                })
              );
      
              const messagesMap = messages.reduce((acc, { friendID, message }) => {
                acc[friendID] = message;
                return acc;
              }, {});
      
              setLastMessages(messagesMap);
            }
          };

          fetchFriendsAndMessages();
    }, [user]);

    return (
        <div className="friendsListContainer">
            <h2>Friends</h2>
            <ul>
                {friends && friends.map((friend) => (
                    <FriendListCard key={friend.id} friend={friend} lastMessage={lastMessages[friend.id]}/>
                ))}
            </ul>
        </div>
    );
}