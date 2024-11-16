import './ProfileFriendsList.css';
import FriendListCard from './FriendListCard/FriendListCard';

export default function ProfileFriendsList({ friendData = {}, messages = {} }) {
    const friendsArray = Object.values(friendData);

    return (
        <div className="friendsListContainer">
            <h2>Friends</h2>
            <ul>
                {friendsArray.map(friend => (
                    <FriendListCard 
                        key={friend.id}
                        friend={friend}
                        messages={messages[friend.chatID]}
                    />
                ))}
            </ul>
        </div>
    );
}