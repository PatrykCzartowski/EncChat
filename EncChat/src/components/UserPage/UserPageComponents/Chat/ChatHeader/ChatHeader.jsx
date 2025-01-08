import React, { useState } from 'react';
import styles from './ChatHeader.module.css';
import { FaBell, FaCog } from 'react-icons/fa';
import placeHolderImage from '../../../../../assets/placeholder_user.png';
import Notifications from './Notifications/Notifications';

export default function ChatHeader({ name, showSettings }) {
    const [showNotifications, setShowNotifications] = useState(false);

    const toggleNotifications = () => {
        setShowNotifications((prev) => !prev);
    };

    return (
        <div className={styles.chatHeader}>
            <div className={styles.leftSection}>
                <button className={styles.profileButton}>
                    <img 
                        src={placeHolderImage} 
                        alt="friend icon" 
                        className={styles.lastChatImage} 
                    />
                    <span className={styles.chatName}>{name}</span>
                </button>
                <button className={styles.profileButton}>
                    <img 
                        src={placeHolderImage} 
                        alt="friend icon" 
                        className={styles.lastChatImage} 
                    />
                </button>
                <button className={styles.profileButton}>
                    <img 
                        src={placeHolderImage} 
                        alt="friend icon" 
                        className={styles.lastChatImage} 
                    />
                </button>
            </div>

            <div className={styles.rightSection}>
                <FaBell 
                    className={styles.icon} 
                    onClick={toggleNotifications} 
                />
                {showSettings && <FaCog className={styles.icon} />}
            </div>
            <Notifications show={showNotifications} />
        </div>
    );
}
