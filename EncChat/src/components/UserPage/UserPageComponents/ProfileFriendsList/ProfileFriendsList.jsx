import Styles from './ProfileFriendsList.module.css';
import FriendListCard from './FriendListCard/FriendListCard';

export default function ProfileFriendsList({ friendData = {}, messages = {}, onChangeOpenedChat }) {
    const friendsArray = Object.values(friendData);

    return (
        <div className="friendsListContainer">
            <h2>Friends</h2>
            <ul>
                {friendsArray.map(friend => (
                    <div onClick={() => onChangeOpenedChat(friend.chatID)}>
                    <FriendListCard 
                        key={friend.id}
                        friend={friend}
                        messages={messages[friend.chatID]}
                    />
                    </div>
                ))}
            </ul>
        </div>
    );
}