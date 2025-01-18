import Styles from './ChatMessage.module.css';
import placeHolderImage from '../../../../../assets/placeholder_user.png';

export default function ChatMessage({ message, accountId, fData, position }) {
    const isUserMessage = message.authorId === accountId;

    return (
        <div
            className={`${Styles.messageBubble} ${
                isUserMessage ? Styles.userMessage : Styles.otherMessage
            } ${Styles[position]}`}
        >
            {!isUserMessage && (position === 'first' || position === 'single') && (
                <img className={Styles.messageImg} src={fData.avatar || placeHolderImage} alt="User" />
            )}
            <p className={Styles.messageContent}>{message.content}</p>
        </div>
    );
}
