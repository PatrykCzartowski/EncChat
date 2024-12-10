import { renderMatches } from 'react-router-dom';
import Styles from './Chat.module.css';
import ChatMessage from './ChatMessage/ChatMessage';

import { useEffect } from 'react';

export default function Chat({ chatData, handleMessageSubmit, accountId, friendsData }) {

    if (!chatData || chatData.length === 0) {
        return <div className={Styles.noChatSelected}>No chat selected</div>;
    }

    const { messages } = chatData[0];

    const friendsInChat = chatData[0].accounts.filter(accountIdInChat => accountIdInChat !== accountId);
    const fData = friendsData.find(friend => friend.accountId === friendsInChat[0]);

    return (
        <div className={Styles.chatContainer}>
            <div className={Styles.chatHeader}>
                {chatData[0].group? (<h2>{chatData[0].name}</h2> ) : (
                    friendsInChat.length > 0 ? (
                        <h2>{fData? `${fData.firstName} ${fData.lastName}` : null}</h2>
                    ) : (
                        <h2>Unknown Friend</h2>
                    )
                )}
            </div>

            <div className={Styles.chatMessages}>
                {messages && messages.length > 0 ? (
                    messages.map((message) => (
                        <ChatMessage key={message.id} message={message} accountId={accountId} fData={fData}/>
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
