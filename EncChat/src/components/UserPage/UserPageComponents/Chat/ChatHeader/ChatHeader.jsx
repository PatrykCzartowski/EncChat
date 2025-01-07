import React from 'react';
import styles from './ChatHeader.module.css';
import { FaBell, FaCog } from 'react-icons/fa';
import placeHolderImage from '../../../../../assets/placeholder_user.png';

export default function ChatHeader({ name, showSettings }) {
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
                <FaBell className={styles.icon} />
                {showSettings && <FaCog className={styles.icon} />}
            </div>
        </div>
    );
}
