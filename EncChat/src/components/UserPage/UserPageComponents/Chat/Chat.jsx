import { useEffect, useRef, useState } from "react";
import Styles from "./Chat.module.css";
import ChatMessage from "./ChatMessage/ChatMessage";
import ChatHeader from "./ChatHeader/ChatHeader";
import ChatSettings from "./ChatSettings/ChatSettings";

export default function Chat({ 
    chatData, 
    handleMessageSubmit, 
    userId, 
    friendsData, 
    sendMessage, 
    currentOpenedChats, 
    onChangeOpenedChat, 
    setCurrentOpenedChats, 
    notifications,
}) {
    const [showSettingsWindow, setShowSettingsWindow] = useState(false);

    const fallbackHeaderName = "No Chat Selected";
    const selectedChat = chatData && chatData.length > 0 ? chatData[0] : null;
    const friendsInChat = selectedChat
        ? selectedChat.accounts.filter(accountIdInChat => accountIdInChat !== userId)
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


    const chatContainerRef = useRef(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: "auto",
            });
        }
    }, [selectedChat?.messages]);

    return (
        <div className={`${Styles.chatContainer}`}>
            <ChatHeader
                showSettingsWindow={showSettingsWindow} 
                onToggleSettings={() => setShowSettingsWindow(prev => !prev)}
                showSettings={!!selectedChat}
                name={chatHeaderName}
                accountId={userId}
                sendMessage={sendMessage}
                currentOpenedChats={currentOpenedChats}
                onChangeOpenedChat={onChangeOpenedChat}
                setCurrentOpenedChats={setCurrentOpenedChats}
                notifications={notifications}
                activeChatId={selectedChat?.id}
                fData={fData}
            />

            {/* Container for messages and settings */}
            <div className={Styles.chatMain}>
                <div className={Styles.chatMessages} ref={chatContainerRef}>
                    {selectedChat ? (
                        selectedChat.messages.length > 0 ? (
                            selectedChat.messages.map((message, index) => {
                                const previousMessage =
                                    index > 0 ? selectedChat.messages[index - 1] : null;
                                const nextMessage =
                                    index < selectedChat.messages.length - 1
                                        ? selectedChat.messages[index + 1]
                                        : null;

                                const isFirst =
                                    !previousMessage || previousMessage.authorId !== message.authorId;
                                const isLast =
                                    !nextMessage || nextMessage.authorId !== message.authorId;

                                const position = isFirst && isLast
                                    ? "single"
                                    : isFirst
                                        ? "first"
                                        : isLast
                                            ? "last"
                                            : "middle";

                                return (
                                    <ChatMessage
                                        key={`${message.id}-${index}`}
                                        message={message}
                                        accountId={userId}
                                        fData={fData}
                                        position={position}
                                    />
                                );
                            })
                        ) : (
                            <div className={Styles.noMessages}>No messages yet</div>
                        )
                    ) : (
                        <div className={Styles.noChatSelected}>No chat selected</div>
                    )}
                </div>

                {/* Chat Settings */}
                {showSettingsWindow && <ChatSettings/>}
            </div>

            {/* Message Input */}
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
