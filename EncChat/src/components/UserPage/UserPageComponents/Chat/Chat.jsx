import { renderMatches } from 'react-router-dom';
import Styles from './Chat.module.css';
import ChatMessage from './ChatMessage/ChatMessage';

export default function Chat({ chatData, handleMessageSubmit }) {
    if (!chatData || chatData.length === 0) {
        return <div className={Styles.noChatSelected}>No chat selected</div>;
    }

    const { messages } = chatData[0];

    return (
        <div className={Styles.chatContainer}>
            <div className={Styles.chatHeader}>
                <h2>Chat {chatData[0].id}</h2>
            </div>

            <div className={Styles.chatMessages}>
                {messages && messages.length > 0 ? (
                    messages.map((message) => (
                        <ChatMessage key={message.id} message={message} />
                    ))
                ) : (
                    <div className={Styles.noMessages}>No messages yet</div>
                )}
            </div>

            <form className={Styles.chatInputForm} onSubmit={handleMessageSubmit}>
                <div className={Styles.inputWrapper}>
                    <input
                        type="text"
                        className={Styles.chatInput}
                        placeholder="Type your message here..."
                    />
                    <button type="submit" className={Styles.chatArrowButton}>
                        ➤
                    </button>
                </div>
            </form>
        </div>
    );
}
