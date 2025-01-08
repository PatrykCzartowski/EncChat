import Styles from "./SearchResult.module.css";

export default function SearchResultCard({
  user,
  friendData,
  onSelectUser,
  currentUserId,
  onHandleSendFriendRequest,
  onHandleBlockAccount,
  onHandleRemoveFriend,
}) {
  const searchResultIsFriend = (searchResult) => {
    for (let i = 0; i < friendData.length; i++) {
      if (friendData[i].accountId === searchResult.id) {
        return true;
      }
    }
    return false;
  };
  const userIsFriend = searchResultIsFriend(user);

  const handleSendFriendRequest = () => {
    onHandleSendFriendRequest(user.id);
  };

  const handleBlockAccount = () => {
    onHandleBlockAccount(user.id);
  };

  const handleRemoveFriend = () => {
    onHandleRemoveFriend(user.id);
  };

  const foundUserIsCurrentUser = user.id === currentUserId;
  if (foundUserIsCurrentUser) {
    return (
      <div className={Styles.searchResultCard} onClick={onSelectUser}>
        {user.profile.firstName} {user.profile.lastName}
        <div>
          <p>That's you!</p>
        </div>
      </div>
    );
  } else {
    return (
      <div className={Styles.searchResultCard} onClick={onSelectUser}>
        {user.profile.firstName} {user.profile.lastName}
        {userIsFriend ? (
          <div>
            <button onClick={handleRemoveFriend}>Remove</button>
          </div>
        ) : (
          <div>
            {user.profile.firstName} {user.profile.lastName}
            <button onClick={handleSendFriendRequest}>Add</button>
            <button onClick={handleBlockAccount}>Block</button>
          </div>
        )}
      </div>
    );
  }
}
