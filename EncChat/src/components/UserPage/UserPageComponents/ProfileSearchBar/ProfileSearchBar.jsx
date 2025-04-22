import './ProfileSearchBar.css';
import { FaSearch } from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';
import SearchResult from './SearchResult/SearchResult';

export default function ProfileSearchBar({friendData, userId, sendMessage, toast}) {
    const [input, setInput] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [debouncedInput, setDebouncedInput] = useState("");
    const [blockedUsers, setBlockedUsers] = useState([]);
    const searchBarRef = useRef();

    const fetchBlockedUsers = async () => {
        try {
            const response = await fetch('/api/blockedUser/list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });
            if (response.ok) {
                const data = await response.json();
                setBlockedUsers(data);
            }
        } catch (error) {
            console.error("Error fetching blocked users:", error);
        }
    };

    const findUsers = async (input) => {
        try {
            const response = await fetch('/api/profile/find', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ providedString: input }),
            });
            const users = await response.json();
            
            console.log('Users found:', users);
            
            return users;
        } catch(error) {
            console.error('Error finding users:', error);
        }
    }

    useEffect(() => {
        fetchBlockedUsers();
    }, [userId]);

    useEffect(() => {
        const delay = setTimeout(() => {
            setDebouncedInput(input);
        }, 500); // Wait for 500ms after the user stops typing
    
        return () => clearTimeout(delay);
    }, [input]);

    useEffect(() => {
        const fetchUsers = async () => {
            if (debouncedInput === "") {
                setSearchResults([]);
                setShowResults(false);
            } else {
                const res = await findUsers(debouncedInput);
                if (res) {
                    const filteredResults = res.filter(user => 
                        !blockedUsers.some(blockedUser => blockedUser.accountId === user.accountId)
                    );
                    setSearchResults(filteredResults);
                    setShowResults(true);
                }
            }
        };
        fetchUsers();
    }, [debouncedInput, blockedUsers]);

    const handleInputChange = async (event) => {
        setInput(event.target.value);
    };
    
        const handleSendFriendRequest = async (foundUserId) => {
            const payload = {
                type: 'SEND_FRIEND_REQUEST',
                payload: {
                    senderId: userId,
                    receiverId: foundUserId,
                },
            };
    
            sendMessage(JSON.stringify(payload));
            console.log("Friend Request Sent");
        };
    
        const handleBlockAccount = async (accountId) => {
            const payload = {
                type: 'BLOCK_USER',
                payload: {
                    blockerId: userId,
                    blockedId: accountId,
                },
            };
            
            sendMessage(JSON.stringify(payload));
            toast.info("Account blocked");
        }

        const handleRemoveFriend = async (friendId) => {
            const payload = {
                type: 'REMOVE_FRIEND',
                payload: {
                    userId: userId,
                    friendId: friendId,
                },
            };

            sendMessage(JSON.stringify(payload));
            toast.info("Processing friend removal...");
        }

        useEffect(() => {
            const handleClickOutside = (event) => {
                if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
                    setShowResults(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, []);

    return (
        <div className="searchBar" ref={searchBarRef}>
                <div className="searchInputWrapper">
                    <form>
                        <input
                            onChange={handleInputChange}
                            onFocus={() => setShowResults(true)}
                            className="searchInput"
                            type="text"
                            placeholder="Search for a user"
                        />
                    <FaSearch className="searchIcon" />
                    </form>
                </div>
                {showResults && (
                <SearchResult 
                    searchResults={searchResults} 
                    friendData={friendData} 
                    userId={userId} 
                    onHandleSendFriendRequest={handleSendFriendRequest}
                    onHandleBlockAccount={handleBlockAccount}
                    onHandleRemoveFriend={handleRemoveFriend}
                />
            )}
        </div>
    );
}