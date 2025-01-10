import React, { useState } from 'react';
import styles from './ChatHeader.module.css';
import { FaBell, FaCog } from 'react-icons/fa';
import Notifications from './Notifications/Notifications';

import ChatHeaderCard from './ChatHeaderCard/ChatHeaderCard';

export default function ChatHeader({ name, showSettings, accountId, sendMessage, currentOpenedChats, onChangeOpenedChat }) {
    const [showNotifications, setShowNotifications] = useState(false);

    const toggleNotifications = () => {
        setShowNotifications((prev) => !prev);
    };

    const handleCardClick = (chatID) => {
        onChangeOpenedChat(chatID);
    }

    return (
        <div className={styles.chatHeader}>
            <div className={styles.leftSection}>
                {currentOpenedChats.length > 0 && (
                    currentOpenedChats.map((chat) => (
                        <ChatHeaderCard key={chat.id} chatData={chat} onCardClick={handleCardClick}/>
                    ))
                )}
            </div>

            <div className={styles.rightSection}>
                <FaBell 
                    className={styles.icon} 
                    onClick={toggleNotifications} 
                />
                {showSettings && <FaCog className={styles.icon} />}
            </div>
            <Notifications show={showNotifications} accountId={accountId} sendMessage={sendMessage}/>
        </div>
    );
}
