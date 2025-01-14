import styles from './ChatHeaderCard.module.css';
import placeHolderImage from '../../../../../../assets/placeholder_user.png';

export default function ChatHeaderCard({ chatData, onCardClick, onRemoveCard }) {
    return (
        <>
        <button className={styles.profileButton} onClick={() => onCardClick(chatData.id)}>
            <img 
                src={placeHolderImage} 
                alt="friend icon" 
                className={styles.lastChatImage} 
            />
            <span className={styles.chatName}>{chatData.name}</span>
        </button>
        <button onClick={() => onRemoveCard(chatData.id)}>
            ✕
        </button>
        </>
    )
}