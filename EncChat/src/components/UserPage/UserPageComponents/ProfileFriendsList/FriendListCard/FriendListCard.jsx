import styles from './FriendListCard.module.css';
import placeHolderImage from '../../../../../assets/placeholder_user.png';

export default function FriendListCard({ chatID, friendID, isGroup, friendData, lastMessage, chatData }) {
    if(!isGroup) {
        return (
            <li className={styles.friendCard}>
                <img src={placeHolderImage} alt="profile image" />
                <h3>{friendData && friendData[0].firstName + ' ' + friendData[0].lastName}</h3>
                <p>{lastMessage.content}</p>
            </li>
        );
    } else {
        return (
            <li className={styles.friendCard}>
                <img src={placeHolderImage} alt="profile image" />
                <h3>{chatData && chatData[0].name }</h3>
                <p>{lastMessage.content}</p>
            </li>
        );
    }
}