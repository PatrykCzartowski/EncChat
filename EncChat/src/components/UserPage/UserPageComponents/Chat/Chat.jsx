import { renderMatches } from 'react-router-dom';
import Styles from './Chat.module.css';
import ChatMessage from './ChatMessage/ChatMessage';
import ChatHeader from './ChatHeader/ChatHeader';
import { useEffect } from 'react';

export default function Chat({ chatData, handleMessageSubmit, accountId, friendsData, sendMessage, currentOpenedChats, onChangeOpenedChat }) {
    const fallbackHeaderName = "No Chat Selected";
    const selectedChat = chatData && chatData.length > 0 ? chatData[0] : null;
    const friendsInChat = selectedChat
        ? selectedChat.accounts.filter(accountIdInChat => accountIdInChat !== accountId)
        : [];
    const fData = friendsInChat.length > 0
        ? friendsData.find(friend => friend.accountId === friendsInChat[0])
        : null;

    const chatHeaderName = selectedChat
        ? selectedChat.group
            ? selectedChat.name
            : friendsInChat.length > 0
                ? `${fData?.firstName || 'Unknown'} ${fData?.lastName || 'Friend'}`
                : 'Unknown Friend'
        : fallbackHeaderName;

    return (
        <div className={Styles.chatContainer}>
<ChatHeader name={chatHeaderName} showSettings={!!selectedChat} accountId={accountId} sendMessage={sendMessage} currentOpenedChats={currentOpenedChats} onChangeOpenedChat={onChangeOpenedChat}/>

            {selectedChat ? (
                <div className={Styles.chatMessages}>
                {selectedChat.messages && selectedChat.messages.length > 0 ? (
                    selectedChat.messages.map((message, index) => {
                        const previousMessage =
                            index > 0 ? selectedChat.messages[index - 1] : null;
                        const nextMessage =
                            index < selectedChat.messages.length - 1
                                ? selectedChat.messages[index + 1]
                                : null;
            
                        const isFirst =
                            !previousMessage ||
                            previousMessage.authorId !== message.authorId;
                        const isLast =
                            !nextMessage || nextMessage.authorId !== message.authorId;
            
                        const position = isFirst && isLast
                            ? 'single'
                            : isFirst
                            ? 'first'
                            : isLast
                            ? 'last'
                            : 'middle';
            
                        return (
                            <ChatMessage
                                key={`${message.id}-${index}`}
                                message={message}
                                accountId={accountId}
                                fData={fData}
                                position={position}
                            />
                        );
                    })
                ) : (
                    <div className={Styles.noMessages}>No messages yet</div>
                )}
            </div>
            ) : (
                <div className={Styles.noChatSelected}>No chat selected</div>
            )}

            {selectedChat && (
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
            )}
        </div>
    );
}
