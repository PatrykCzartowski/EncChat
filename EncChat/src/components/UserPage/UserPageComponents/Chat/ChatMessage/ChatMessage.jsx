import Styles from './ChatMessage.module.css';
import placeHolderImage from '../../../../../assets/placeholder_user.png';

export default function ChatMessage({ message, accountId, fData }) {
    const isUserMessage = message.authorId === accountId ? true : false;
    return (
        <div
            className={`${Styles.messageBubble} ${
                isUserMessage ? Styles.userMessage : Styles.otherMessage
            }`}
        >
            <p className={Styles.messageContent}>
                {isUserMessage? null : <img className={Styles.messageImg} src={placeHolderImage} />}
                {message.content}
            </p>
        </div>
    );
}
