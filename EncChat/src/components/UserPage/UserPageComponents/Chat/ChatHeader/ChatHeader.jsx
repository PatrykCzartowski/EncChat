import React, { useState, useRef, useEffect } from 'react';
import styles from './ChatHeader.module.css';
import { FaBell, FaCog } from 'react-icons/fa';
import Notifications from './Notifications/Notifications';

import ChatHeaderCard from './ChatHeaderCard/ChatHeaderCard';

export default function ChatHeader({
    name,
    showSettings,
    accountId,
    sendMessage,
    currentOpenedChats,
    onChangeOpenedChat,
    setCurrentOpenedChats,
    notifications,
    activeChatId,
}) {
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationsRef = useRef();

    const toggleNotifications = () => {
        setShowNotifications((prev) => !prev);
    };

    const handleCardClick = (chatID) => {
        onChangeOpenedChat(chatID);
    };

    const handleRemoveCard = (chatID) => {
        const updatedChats = currentOpenedChats.filter((chat) => chat.id !== chatID);
        setCurrentOpenedChats(updatedChats);

        const updatedLocalChats = updatedChats.map((chat) => chat.id);
        localStorage.setItem('openedChats', JSON.stringify(updatedLocalChats));

        if (updatedChats.length > 0) {
            onChangeOpenedChat(updatedChats[0].id);
        } else {
            onChangeOpenedChat(null);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className={styles.chatHeader}>
            <div className={styles.leftSection}>
                {currentOpenedChats.map((chat) => (
                    <ChatHeaderCard
                        key={chat.id}
                        chatData={chat}
                        onCardClick={handleCardClick}
                        onRemoveCard={handleRemoveCard}
                        isActive={chat.id === activeChatId}
                    />
                ))}
            </div>

            <div className={styles.rightSection}>
                <FaBell className={styles.icon} onClick={toggleNotifications} />
                {notifications.length > 0 && <span>{notifications.length}</span>}
                {showSettings && <FaCog className={styles.icon} />}
            </div>

            {showNotifications && (
                <div ref={notificationsRef}>
                    <Notifications
                        show={showNotifications}
                        accountId={accountId}
                        sendMessage={sendMessage}
                        notifications={notifications}
                        setNotificationCount={setNotificationCount}
                    />
                </div>
            )}

        </div>
    );
}
