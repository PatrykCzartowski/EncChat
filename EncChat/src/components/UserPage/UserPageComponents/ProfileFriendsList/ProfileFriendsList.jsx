import Styles from './ProfileFriendsList.module.css';
import FriendListCard from './FriendListCard/FriendListCard';

export default function ProfileFriendsList({ accountID, friendData, chatData, onChangeOpenedChat }) {
    const getLastMessage = (chatID) => {
        let chatMessages;
        chatData.forEach(chat => {
            if(chat.id === chatID) {
                chatMessages = chat.messages;
            }
        });
        if(chatMessages.length === 0) return 'No messages yet';
        const lastMessage = chatMessages[chatMessages.length - 1];
        return lastMessage;
    };

    const handleClick = (chatID) => {
        onChangeOpenedChat(chatID);
    }

    return (
        <div className="friendsListContainer">
            <h2>Chats with Friends</h2>
            <ul>
            {Array.isArray(chatData) ? chatData.map(chat => {
                if (chat.group === false) {
                    const friendID = chat.accounts.filter(account => account !== accountID);
                    return (
                        <div key={chat.id+10} onClick={() => handleClick(chat.id)}>
                        <FriendListCard 
                            key={chat.id}
                            chatID={chat.chatId}
                            friendID={friendID[0]}
                            isGroup = {false}
                            friendData={friendData.filter(data => data.accountId === friendID[0])}
                            lastMessage={getLastMessage(chat.id)}
                        />
                        </div>
                    );
                }
                return null;
            }) : 'No chat data available'}
            </ul>
            <h2>Group Chats</h2>
            <ul>
            {Array.isArray(chatData) ? chatData.map(chat => {
                if (chat.group === true) {
                    const friendsID = chat.accounts.filter(account => account !== accountID);
                    return (
                        <div key={chat.id+10} onClick={() => handleClick(chat.id)}>
                        <FriendListCard
                            key={chat.id}
                            chatID={chat.id}
                            friendID={friendsID}
                            isGroup = {true}
                            friendData={friendData}
                            lastMessage={getLastMessage(chat.id)}
                            chatData={chatData.filter(chatData => chatData.id === chat.id)}
                        />
                        </div>
                    );
                }
                return null;
            }) : 'No chat data available'}
            </ul>
        </div>
    );
}