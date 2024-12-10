import styles from './FriendListCard.module.css';
import placeHolderImage from '../../../../../assets/placeholder_user.png';

export default function FriendListCard({ chatID, friendID, isGroup, friendData, lastMessage, chatData }) {
    if(!isGroup) {
        return (
            <li className={styles.friendCard}>
                <img src={placeHolderImage} alt="profile image" />
                <h3>{friendData && friendData.length > 0 ? friendData[0].firstName + ' ' + friendData[0].lastName : 'Unknown'}</h3>
                <p>{lastMessage.content}</p>
            </li>
        );
    } else {
        return (
            <li className={styles.friendCard}>
                <img src={placeHolderImage} alt="profile image" />
                <h3>{chatData && chatData.length > 0 ? chatData[0].name : 'Unknown'}</h3>
                <p>{lastMessage.content}</p>
            </li>
        );
    }
}