import styles from './FriendListCard.module.css';
import placeHolderImage from '../../../../../assets/placeholder_user.png';

export default function FriendListCard({ chatID, friendID, isGroup, friendData, lastMessage, chatData }) {
    if (!isGroup) {
        //individual
        return (
            <li className={styles.friendCard}>

                <img 
                    src={friendData && friendData[0]?.profilePicture || placeHolderImage} 
                    alt="Friend profile" 
                    className={styles.friendCardImage} 
                />
                <div className={styles.friendCardContent}>
                    <h3 className={styles.friendName}>
                        {friendData && `${friendData[0]?.firstName} ${friendData[0]?.lastName}`}
                    </h3>
                    <p className={styles.lastMessage}>{lastMessage? lastMessage : null}</p>
                </div>
            </li>
        );
    } else {
        //group 
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
                    <p className={styles.lastMessage}>{lastMessage? lastMessage : null}</p>
                </div>
            </li>
        );
    }
}
