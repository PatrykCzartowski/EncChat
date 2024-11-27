import Styles from './ChatMessage.module.css';

export default function ChatMessage( {message} ) {
    return (
        <div>
            <p>{message.content}</p>
        </div>
    );
}