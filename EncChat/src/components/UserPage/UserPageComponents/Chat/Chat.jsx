import Styles from './Chat.module.css';

import ChatMessage from './ChatMessage/ChatMessage';

export default function Chat({chatData, handleMessageSubmit }) {
    return (
        <div>
            {chatData.length > 0 ? (
                <div>Current chat {chatData[0].id}</div>
            ) : (
                <div>No chat selected</div>
            )}

            {chatData.length > 0 ? (
                chatData[0].messages.map(message => (
                    <ChatMessage 
                        key={message.id}
                        message={message}
                    />
                ))
            ) : ('No messages yet')}

        {chatData.length > 0 &&
            <form onSubmit={handleMessageSubmit}>
                <input placeholder='type your message here'/>
                <button type="submit">send</button>
            </form>
        }
        </div>
    );
}