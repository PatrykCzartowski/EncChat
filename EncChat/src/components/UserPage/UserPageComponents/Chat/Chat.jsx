import Styles from './Chat.module.css';

import ChatMessage from './ChatMessage/ChatMessage';

export default function Chat({ openedChat, chatMessages = {}, handleMessageSubmit }) {
    const messagesArray = Object.values(chatMessages);


    return (
        <div>
        <div>Current chat {openedChat}</div>
        <div className={Styles.chatContainer}>
            {openedChat? messagesArray.map(message => (
                    <ChatMessage 
                        key={message.id}
                        message={message.content}
                    />
                )) : ''}
                
        </div>
        {openedChat &&
            <div className={Styles.messageInput}>
                <form onSubmit={handleMessageSubmit}>
                    <input type="text" placeholder="type your message here"/>
                    <button>Send</button>
                </form>
            </div>
        }
        </div>
    );
}