import React, { useState, useEffect } from 'react';
import styles from './Notifications.module.css';
import FriendRequestCard from './NotificationsCards/FriendRequestCard';


export default function Notifications({ show, accountId, sendMessage, notifications }) {
    const [activeTab, setActiveTab] = useState('others');
    const [notificationsCount, setNotificationsCount] = useState(0);
    const [friendRequests, setFriendRequests] = useState([]);
    const [otherNotifications, setOtherNotifications] = useState([]);

    const getFriendRequests = async () => {
        const response = await fetch('/api/friendRequest/get', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: accountId }),
        })
        if(response.ok) {
            const requests = await response.json();
            setFriendRequests(requests);
            setNotificationsCount(requests.length);
        }
    }

    const HandleAcceptFriendRequest = async (requestId, senderId) => {
        const payload = {
            type: 'FRIEND_REQUEST_ACCEPTED',
            payload: {
                requestId: requestId,
                friendId: senderId,
                accountId: accountId,
                senderId: senderId
            }
        };
        const localStorageNotificationCount = JSON.parse(localStorage.getItem('notificationCount')) || 0;
        if(localStorageNotificationCount > 0) {
            const updatedNotificationCount = localStorageNotificationCount - 1;
            localStorage.setItem('notificationCount', JSON.stringify(updatedNotificationCount));
            setNotificationsCount(updatedNotificationCount);
        }
        sendMessage(JSON.stringify(payload));
        getFriendRequests();
    }

    const HandleDeclineFriendRequest = async (requestId) => {
        const localStorageNotificationCount = JSON.parse(localStorage.getItem('notificationCount')) || 0;
        if(localStorageNotificationCount > 0) {
            const updatedNotificationCount = localStorageNotificationCount - 1;
            localStorage.setItem('notificationCount', JSON.stringify(updatedNotificationCount));
            setNotificationsCount(updatedNotificationCount);
        }
        const response = await fetch('/api/friendRequest/decline', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ requestId: requestId }),
        });
        if(response.ok) {
            const result = await response.json();
            if(result) {
                getFriendRequests();
            }  
        }
    }

    useEffect(() => {
        getFriendRequests();
        setFriendRequests((prev) => [
            ...prev,
            ...notifications.filter((notification) => notification.type === 'FRIEND_REQUEST')
        ])
        setOtherNotifications((prev) => [
            ...prev,
            ...notifications.filter((notification) => notification.type === 'OTHER_NOTIFICATION')
        ])
    }, [notificationsCount]);

    if (!show) return null;

    return (
        <div className={styles.notificationsContainer}>
            <div className={styles.tabs}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'others' ? styles.active : ''}`}
                    onClick={() => setActiveTab('others')}
                >
                    Others
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'requests' ? styles.active : ''}`}
                    onClick={() => setActiveTab('requests')}
                >
                    Friend Requests
                </button>
            </div>

            <div className={styles.tabContent}>
                {activeTab === 'others' && (
                    <div>
                        <p className={styles.notificationItem}>No other notifications</p>
                    </div>
                )}
                {activeTab === 'requests' && (
                    <div>
                        {friendRequests && friendRequests.filter(request => !request.hidden).length > 0 ? (
                            friendRequests.filter(request => !request.hidden).map((request) => (
                                <div key={request.id} className={styles.notificationItem}>
                                    <FriendRequestCard 
                                        key={request.id} 
                                        request={request}
                                        onHandleAcceptFriendRequest={HandleAcceptFriendRequest}
                                        onHandleDeclineFriendRequest={HandleDeclineFriendRequest}
                                    />
                                </div>
                            ))
                        ) : (
                            <p className={styles.notificationItem}>No friend requests</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
