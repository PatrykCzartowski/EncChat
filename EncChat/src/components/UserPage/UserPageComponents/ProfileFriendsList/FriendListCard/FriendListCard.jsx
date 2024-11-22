import styles from './FriendListCard.module.css';
import placeHolderImage from '../../../../../assets/placeholder_user.png';

export default function FriendListCard({ friend, lastMessage }) {
    return (
        <div className={styles.friendCard}>
            <img src={placeHolderImage} alt="Friend" />
            <h3>{friend.name_surname}</h3>
            <p>{lastMessage}</p>
        </div>
    );
}