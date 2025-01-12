import styles from './ChatHeaderCard.module.css';
import placeHolderImage from '../../../../../../assets/placeholder_user.png';

export default function ChatHeaderCard({ chatData, onCardClick, updateCurrentlyOpenedChats }) {
    
    const handleCancelClick = () => {
        const openedChats = JSON.parse(localStorage.getItem('openedChats')) || [];
        for(let i=0; i<openedChats.length; i++) {
            if(openedChats[i] == chatData.id) {
                openedChats.splice(i, 1);
                localStorage.setItem('openedChats', JSON.stringify(openedChats));
                updateCurrentlyOpenedChats();
            }
        }
    }
    
    return (
        <button className={styles.profileButton} onClick={() => onCardClick(chatData.id)}>
            <img 
                src={placeHolderImage} 
                alt="friend icon" 
                className={styles.lastChatImage} 
            />
            <span className={styles.chatName}>{chatData.name}</span>
            <div className={styles.CancelButton} onClick={handleCancelClick}>X</div>
        </button>
    )
}