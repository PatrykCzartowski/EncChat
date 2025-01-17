import './ProfileSearchBar.css';
import { FaSearch } from 'react-icons/fa';
import { useState } from 'react';
import SearchResult from './SearchResult/SearchResult';
import { useWebSocket } from 'react-use-websocket';

export default function ProfileSearchBar({friendData, currentUserId, sendMessage}) {
    const [input, setInput] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const findUsers = async (input) => {
        try {
            const response = await fetch('/api/account/find_profile_like', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ providedString: input }),
            });
            const users = await response.json();
            return users;
        } catch(error) {
            console.error('Error finding users:', error);
        }
    }

    const handleInputChange = async (event) => {
        const value = event.target.value;
        setInput(value);
    
        if (value === '') {
            setSearchResults([]);
        } else {
            const res = await findUsers(value);
            if (res) setSearchResults(res);
        }
    };
    
        const handleSendFriendRequest = async (userId) => {
            const wsClientId = sessionStorage.getItem('wsClientId');
            const payload = {
                type: 'SEND_FRIEND_REQUEST',
                payload: {
                    senderId: currentUserId,
                    receiverId: userId,
                    senderWsClientId: wsClientId,
                },
            };
    
            sendMessage(JSON.stringify(payload));
            console.log("Friend Request Sent");
        };
    
        const handleBlockAccount = async () => {
            console.log("Account Blocked");
        }
        
        const handleRemoveFriend = async () => {
            console.log("Friend Removed");
        }

    return (
        <div className="searchBar">
            <div className="searchInputWrapper">
                <form>
                    <input
                        onChange={handleInputChange}
                        className="searchInput"
                        type="text"
                        placeholder="Search for a user"
                    />
                <FaSearch className="searchIcon" />
                </form>
            </div>
            <SearchResult 
                searchResults={searchResults} 
                friendData={friendData} 
                currentUserId={currentUserId} 
                onHandleSendFriendRequest={handleSendFriendRequest}
                onHandleBlockAccount={handleBlockAccount}
                onHandleRemoveFriend={handleRemoveFriend}
            />
        </div>
    );
}