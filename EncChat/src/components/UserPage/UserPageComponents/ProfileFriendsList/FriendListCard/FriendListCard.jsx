import styles from './FriendListCard.module.css';
import placeHolderImage from '../../../../../assets/placeholder_user.png';

export default function FriendListCard({ friend, messages }) {
    console.log(messages);
    console.log(friend);
    return (
        <div className={styles.friendCard}>
            <img src={placeHolderImage} alt="Friend" />
            <h3>{friend.name_surname}</h3>
            <p>{messages ? messages[messages.length -1].content : 'no messages yet'}</p>
        </div>
    );
}