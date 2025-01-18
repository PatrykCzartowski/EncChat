import styles from './FriendListCard.module.css';
import placeHolderImage from '../../../../../assets/placeholder_user.png';

export default function FriendListCard({ isGroup, friendData, lastMessage, chatData, unreadCount }) {
    if (!isGroup) {
        // Individual
        return (
            <li className={styles.friendCard}>
                <img 
                    src={friendData && friendData[0]?.avatar || placeHolderImage} 
                    alt="Friend profile" 
                    className={styles.friendCardImage} 
                />
                <div className={styles.friendCardContent}>
                    <h3 className={styles.friendName}>
                        {friendData && `${friendData[0]?.firstName} ${friendData[0]?.lastName}`}
                    </h3>
                    <p className={styles.lastMessage}>{lastMessage ? lastMessage : null}</p>
                </div>
                {unreadCount > 0 && (
                    <span className={styles.unreadCount}>{unreadCount}</span>
                )}
            </li>
        );
    } else {
        // Group
        return (
            <li className={styles.friendCard}>
                <img 
                    src={placeHolderImage} 
                    alt="Group profile" 
                    className={styles.friendCardImage} 
                />
                <div className={styles.friendCardContent}>
                    <h3 className={styles.friendName}>
                        {chatData && chatData[0]?.name}
                    </h3>
                    <p className={styles.lastMessage}>{lastMessage ? lastMessage : null}</p>
                </div>
                {unreadCount > 0 && (
                    <span className={styles.unreadCount}>{unreadCount}</span>
                )}
            </li>
        );
    }
}

