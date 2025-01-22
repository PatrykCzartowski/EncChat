import styles from './ChatHeaderCard.module.css';
import placeHolderImage from '../../../../../../assets/placeholder_user.png';

export default function ChatHeaderCard({ chatData, onCardClick, onRemoveCard, isActive }) {
    return (
        <div
            className={`${styles.profileButton} ${isActive ? styles.activeChat : ''}`}
            onClick={() => onCardClick(chatData.id)}
        >
            <div className={styles.chatName}>{chatData.name}</div>
            <button
                className={styles.closeButton}
                onClick={(e) => {
                    e.stopPropagation();
                    onRemoveCard(chatData.id);
                }}
            >
                ✕
            </button>
        </div>
    );
}

