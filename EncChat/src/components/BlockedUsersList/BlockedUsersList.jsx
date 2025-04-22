import { useState, useEffect } from 'react';
 import { FaUserSlash, FaUnlock } from 'react-icons/fa';
 import './BlockedUsersList.css';
 
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
         <div className="blockedUsersContainer">
             <h3 className="sectionTitle">
                 <FaUserSlash className="titleIcon" />
                 Blocked Users
             </h3>
             
             {blockedUsers.length === 0 ? (
                 <p className="noBlockedUsers">You haven't blocked any users</p>
             ) : (
                 <ul className="blockedUsersList">
                     {blockedUsers.map(user => (
                         <li key={user.accountId} className="blockedUserItem">
                             <div className="userInfo">
                                 <img 
                                     src={user.avatar || '/default-avatar.png'} 
                                     alt={`${user.firstName} ${user.lastName}`} 
                                     className="userAvatar"
                                 />
                                 <div className="userData">
                                     <span className="userName">
                                        {`${user.firstName} ${user.lastName}`}
                                     </span>
                                 </div>
                             </div>
                             <button 
                                 onClick={() => handleUnblock(user.accountId)}
                                 className="unblockButton"
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