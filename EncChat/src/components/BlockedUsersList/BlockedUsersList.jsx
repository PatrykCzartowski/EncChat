import { useState, useEffect } from 'react';
 import { FaUserSlash, FaUnlock } from 'react-icons/fa';
 import Styles from "./BlockedUsersList.module.css";
 
 export default function BlockedUsersList({ userId, toast, sendMessage }) {
     const [blockedUsers, setBlockedUsers] = useState([]);
     const [loading, setLoading] = useState(true);
 
     useEffect(() => {
         fetchBlockedUsers();
     }, [userId]);
 
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
                 console.log(data);
                 setBlockedUsers(data);
                 setLoading(false);
             } else {
                 toast.error("Failed to fetch blocked users");
             }
         } catch (error) {
             console.error("Error fetching blocked users:", error);
             toast.error("Error loading blocked users");
         } finally {
             setLoading(false);
         }
     };
 
     const handleUnblock = async (blockedId) => {
         const payload = {
             type: 'UNBLOCK_USER',
             payload: {
                 userId: userId,
                 blockedId: blockedId,
             },
         };
 
         sendMessage(JSON.stringify(payload));
         toast.info("Processing unblock request...");
     };
 
     if (loading) {
         return <div className="loading">Loading blocked users...</div>;
     }
 
     return (
        <div className={Styles.blockedUsersContainer}>
        <h3 className={Styles.sectionTitle}>
            <FaUserSlash className={Styles.titleIcon} />
            Blocked Users
        </h3>
        
        {blockedUsers.length === 0 ? (
            <p className={Styles.noBlockedUsers}>You haven't blocked any users</p>
        ) : (
            <ul className={Styles.blockedUsersList}>
                {blockedUsers.map(user => (
                    <li key={user.accountId} className={Styles.blockedUserItem}>
                        <div className={Styles.userInfo}>
                            <img 
                                src={user.avatar || '/default-avatar.png'} 
                                alt={`${user.firstName} ${user.lastName}`} 
                                className={Styles.userAvatar}
                            />
                            <div className={Styles.userData}>
                                <span className={Styles.userName}>
                                   {`${user.firstName} ${user.lastName}`}
                                </span>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleUnblock(user.accountId)}
                            className={Styles.unblockButton}
                        >
                            <FaUnlock /> Unblock
                        </button>
                    </li>
                ))}
            </ul>
        )}
    </div>
     );
 }