import React, { useState } from 'react';
import styles from './ChatHeader.module.css';
import { FaBell, FaCog } from 'react-icons/fa';
import Notifications from './Notifications/Notifications';

import ChatHeaderCard from './ChatHeaderCard/ChatHeaderCard';

export default function ChatHeader({ name, showSettings, accountId, sendMessage, currentOpenedChats, onChangeOpenedChat, setCurrentOpenedChats, notifications }) {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);

    const toggleNotifications = () => {
    
        setShowNotifications((prev) => !prev);
        if (notificationCount > 0) {
            setNotificationCount(0);
        }
    };

    const handleCardClick = (chatID) => {
        onChangeOpenedChat(chatID);
    }

    const handleRemoveCard = (chatID) => {
        const updatedChats = currentOpenedChats.filter(chat => chat.id !== chatID);
        setCurrentOpenedChats(updatedChats);

        // Update local storage
        const updatedLocalChats = updatedChats.map(chat => chat.id);
        localStorage.setItem('openedChats', JSON.stringify(updatedLocalChats));

        // Switch to the next chat if available
        if (updatedChats.length > 0) {
            onChangeOpenedChat(updatedChats[0].id);
        } else {
            onChangeOpenedChat(null); // No chat to display
        }
    };

    return (
        <div className={styles.chatHeader}>
            <div className={styles.leftSection}>
                {currentOpenedChats.length > 0 && (
                    currentOpenedChats.map((chat) => (
                        <ChatHeaderCard 
                            key={chat.id} 
                            chatData={chat} 
                            onCardClick={handleCardClick}
                            onRemoveCard={handleRemoveCard}
                        />
                    ))
                )}
            </div>

            <div className={styles.rightSection}>
                <FaBell 
                    className={styles.icon} 
                    onClick={toggleNotifications} 
                />
                {notifications.length > 0 && <span>{notifications.length}</span>}
                {showSettings && <FaCog className={styles.icon} />}
            </div>
            <Notifications show={showNotifications} accountId={accountId} sendMessage={sendMessage} notifications={notifications} notificationsCount={notifications.length}/>
        </div>
    );
}
