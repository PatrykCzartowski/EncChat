import styles from './FriendListCard.module.css';
import placeHolderImage from '../../../../../assets/placeholder_user.png';

export default function FriendListCard({ isGroup, userFriend, lastMessage, chatData, unreadCount }) {

    const displayedLastMessage = (lastMessage && lastMessage.includes("iv") && lastMessage.includes("data"))
        ? "🔒 [Encrypted message - cannot decrypt]"
        : lastMessage;
    
    if (!isGroup) {
        // Individual
        return (
            <li className={`${styles.friendCard} friendListItem`}>
                <img 
                    src={userFriend && userFriend[0]?.avatar || placeHolderImage} 
                    alt="Friend profile" 
                    className={styles.friendCardImage} 
                />
                <div className={styles.friendCardContent}>
                    <h3 className={styles.friendName}>
                        {userFriend && `${userFriend[0]?.firstName} ${userFriend[0]?.lastName}`}
                    </h3>
                    <p className={styles.lastMessage}>{displayedLastMessage ? displayedLastMessage : null}</p>
                </div>
                {unreadCount > 0 && (
                    <span className={styles.unreadCount}>{unreadCount}</span>
                )}
            </li>
        );
    } else {
        // Group
        return (
            <li className={`${styles.friendCard} friendListItem`}>
                <img 
                    src={placeHolderImage} 
                    alt="Group profile" 
                    className={styles.friendCardImage} 
                />
                <div className={styles.friendCardContent}>
                    <h3 className={styles.friendName}>
                        {chatData && chatData[0]?.name}
                    </h3>
                    <p className={styles.lastMessage}>{displayedLastMessage ? displayedLastMessage : null}</p>
                </div>
                {unreadCount > 0 && (
                    <span className={styles.unreadCount}>{unreadCount}</span>
                )}
            </li>
        );
    }
}

