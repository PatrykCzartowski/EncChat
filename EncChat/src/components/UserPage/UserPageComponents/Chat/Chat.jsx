import { renderMatches } from 'react-router-dom';
import Styles from './Chat.module.css';

import ChatMessage from './ChatMessage/ChatMessage';

export default function Chat({chatData, handleMessageSubmit, messages}) {
    return (
        <div className={Styles.Background}>
            {chatData.length > 0 ? (
                <div>Current chat {chatData[0].id}</div>
            ) : (
                <div>No chat selected</div>
            )}

            {messages}

        {chatData.length > 0 &&
            <form onSubmit={handleMessageSubmit}>
                <input placeholder='type your message here'/>
                <button type="submit">send</button>
            </form>
        }
        </div>
    );
}