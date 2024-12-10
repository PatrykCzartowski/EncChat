import Styles from './ChatMessage.module.css';

export default function ChatMessage({ message }) {
    return (
        <div
            className={`${Styles.messageBubble} ${
                message.sender === 'user' ? Styles.userMessage : Styles.otherMessage
            }`}
        >
            <p className={Styles.messageContent}>{message.content}</p>
        </div>
    );
}
