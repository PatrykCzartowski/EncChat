import Styles from './SearchResult.module.css';

export default function SearchResultCard({ user, friendData }) {
    
    const handleSendFriendRequest = async () => {
        console.log("Friend Request Sent");
    }

    const handleBlockAccount = async () => {
        console.log("Account Blocked");
    }
    
    const handleRemoveFriend = async () => {
        console.log("Friend Removed");
    }

    const searchResultIsFriend = (searchResult) => {
        for (let i = 0; i < friendData.length; i++) {
            if (friendData[i].accountId === searchResult.id) {
                return true;
            }
        }
        return false;
    }
    const userIsFriend = searchResultIsFriend(user);   
    return (
        
        <div>
            {user.profile.firstName} {user.profile.lastName}
            {userIsFriend? (
                <div>
                    <div onClick={handleRemoveFriend}>Remove</div>
                </div>
            ) : (
            <div>
                <div onClick={handleSendFriendRequest}>Add</div>
                <div onClick={handleBlockAccount}>Block</div>
            </div>
            )}
            
        </div>
    )
}